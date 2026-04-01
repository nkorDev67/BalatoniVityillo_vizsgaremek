const { pool } = require('mssql');
const { poolPromise, sql } = require('../config/dbconfig');


exports.getAllRequestsWithTasks = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // 1. Lekérjük a fő kéréseket és a felhasználóneveket
        const requestsResult = await pool.request().query(`
            SELECT 
                f.FelujitasId, 
                f.HelyszinCim, 
                f.Leiras, 
                f.Statusz, 
                f.KezdesDatuma,
                u.Felhasznalonev AS UgyfelNeve
            FROM Felujitas f
            LEFT JOIN dbo.Felhasznalo u ON f.FelhasznaloId = u.FelhasznaloId
            WHERE f.Statusz != 'Befejezve'
            ORDER BY f.KezdesDatuma ASC

        `);

        // 2. Lekérjük az ÖSSZES feladatot
        const tasksResult = await pool.request().query(`
            SELECT FeladatId, FelujitasId, Tipus, Terulet, Ar 
            FROM Feladat
        `);

        // 3. Összefésüljük a kettőt a kódban
        const requests = requestsResult.recordset.map(keres => {
            return {
                ...keres,
                // Kikeressük azokat a feladatokat, amik ehhez a kéréshez tartoznak
                Feladatok: tasksResult.recordset.filter(t => t.FelujitasId === keres.FelujitasId)
            };
        });

        res.json(requests);
    } catch (err) {
        console.error("SQL hiba:", err);
        res.status(500).json({ error: "Nem sikerült lekérni a kérelmeket." });
    }
};

exports.updateStatus = async (req, res) => {
    const {felujitasId, ujStatusz, ujDatum} = req.body;
    try{
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, felujitasId)
            .input('statusz', sql.NVarChar, ujStatusz)
            .input('datum', sql.Date, ujDatum)
            .query(`UPDATE Felujitas
                SET Statusz = @statusz, KezdesDatuma = @datum 
                WHERE FelujitasId = @id
                `);
                res.json({ message: 'Sikeres mentés!' });
            }catch(err) {
                res.status(500).json({ error: 'Hiba a státusz frissítésekor.' });
    } 
}




// visszaadja azoknak a felhasználóknak az adatait, akik jelenleg szakemberként vannak megjelölve
exports.getProfessionals = async (req, res) => {
    try {
        const pool = await poolPromise;
        // csatlakozunk a Szakember táblához, hogy lássuk a szakmájukat is
        const result = await pool.request().query(`
            SELECT 
                s.SzakemberId AS id, 
                f.FelhasznaloId AS felhasznaloId,
                f.Felhasznalonev AS nev, 
                f.Email AS email, 
                f.TelefonSzam AS telefonszam,
                f.Jogosultsag AS jogosultsag,
                s.Szak AS szak
            FROM Szakember s
            JOIN Felhasznalo f ON s.FelhasznaloId = f.FelhasznaloId
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('getProfessionals hiba:', err);
        res.status(500).json({ error: 'Hiba a szakemberek lekérésekor.' });
    }
};

// email alapján "szakemberré" avanzsál egy felhasználót, opcionálisan beállítva a szakmáját
exports.addWorkerByEmail = async (req, res) => {
    try {
        const { email, szak } = req.body;
        if (!email) return res.status(400).json({ message: 'Email megadása kötelező.' });

        const pool = await poolPromise;
        // először csak a szerepkört állítjuk át
        const updateReq = pool.request().input('email', sql.NVarChar, email);
        const roleResult = await updateReq.query(`UPDATE Felhasznalo SET Jogosultsag = 'szakember' WHERE Email = @email`);
        if (roleResult.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'A megadott emailhez nem található felhasználó.' });
        }

        // a felhasználó id-ját is le kell kérni, hogy beírjuk a Szakember táblába
        const idRes = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT FelhasznaloId FROM Felhasznalo WHERE Email = @email');
        const felhId = idRes.recordset[0]?.FelhasznaloId;

        // ha van szakma, vagy ha nincs de még nincsen szakember rekord, beszúrunk/ frissítünk
        if (felhId) {
            if (szak) {
                // upsert a Szakember táblába
                await pool.request()
                    .input('fid', sql.Int, felhId)
                    .input('szak', sql.NVarChar, szak)
                    .query(`
                        IF EXISTS (SELECT 1 FROM Szakember WHERE FelhasznaloId = @fid)
                            UPDATE Szakember SET Szak = @szak WHERE FelhasznaloId = @fid
                        ELSE
                            INSERT INTO Szakember (FelhasznaloId, Szak) VALUES (@fid, @szak)
                    `);
            } else {
                // ha nincs szakma, de még nincs rekord, akkor csak beszúrunk null szakma mellett
                await pool.request()
                    .input('fid', sql.Int, felhId)
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM Szakember WHERE FelhasznaloId = @fid)
                            INSERT INTO Szakember (FelhasznaloId) VALUES (@fid)
                    `);
            }
        }

        // visszaküldjük a frissített szakember adatait
        const sel = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT 
                    s.SzakemberId AS id,
                    f.FelhasznaloId AS felhasznaloId,
                    f.Felhasznalonev AS nev,
                    f.Email AS email,
                    f.TelefonSzam AS telefonszam,
                    f.Jogosultsag AS jogosultsag,
                    s.Szak AS szak
                FROM Felhasznalo f
                LEFT JOIN Szakember s ON s.FelhasznaloId = f.FelhasznaloId
                WHERE f.Email = @email
            `);

        res.json(sel.recordset[0]);
    } catch (err) {
        console.error('addWorkerByEmail hiba:', err);
        res.status(500).json({ error: 'Hiba a munkás felvételekor.' });
    }
};

// visszafokoz egy szakembert normál felhasználóvá (például kirúgáskor)
exports.removeWorker = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'Érvénytelen id.' });

        const pool = await poolPromise;
        const workerResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT TOP 1 SzakemberId, FelhasznaloId
                FROM Szakember
                WHERE SzakemberId = @id OR FelhasznaloId = @id
            `);

        const worker = workerResult.recordset[0];
        if (!worker) {
            return res.status(404).json({ message: 'A megadott azonosítóval nem található szakember.' });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const deleteAssignmentsResult = await transaction.request()
                .input('szakemberId', sql.Int, worker.SzakemberId)
                .query('DELETE FROM Munkakiosztas WHERE SzakemberId = @szakemberId');

            await transaction.request()
                .input('szakemberId', sql.Int, worker.SzakemberId)
                .query('DELETE FROM Szakember WHERE SzakemberId = @szakemberId');

            await transaction.request()
                .input('felhasznaloId', sql.Int, worker.FelhasznaloId)
                .query("UPDATE Felhasznalo SET Jogosultsag = 'felhasznalo' WHERE FelhasznaloId = @felhasznaloId");

            await transaction.commit();

            res.json({
                success: true,
                felhasznaloId: worker.FelhasznaloId,
                szakemberId: worker.SzakemberId,
                toroltBeosztasok: deleteAssignmentsResult.rowsAffected?.[0] ?? 0,
            });
        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError;
        }
    } catch (err) {
        console.error('removeWorker hiba:', err);
        res.status(500).json({ error: 'Hiba történt a munkás visszafokozásakor.' });
    }
};

exports.getTaskForAssigments = async (req, res) => {
    try{
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                ft.FeladatId AS id,
                f.HelyszinCim AS helyszin,
                ft.Tipus AS tipus,
                f.KezdesDatuma AS datum
            FROM Feladat ft
            JOIN Felujitas f ON ft.FelujitasId = f.FelujitasId
            WHERE f.KezdesDatuma IS NOT NULL 
            AND f.Statusz != 'Befejezve'
        `);
        const feladatok = result.recordset;

        // minden feladathoz beosztottak lekérése
        for (let f of feladatok) {
            const beosztasRes = await pool.request()
                .input('fId', sql.Int, f.id)
                .query("SELECT SzakemberId FROM Munkakiosztas WHERE FeladatId = @fId");
            
            f.mentettMunkasok = beosztasRes.recordset.map(r => r.SzakemberId);
        }

        res.json(feladatok);
    } catch (err) {
        console.error("SQL Hiba:", err.message);
        res.status(500).json({ error: err.message });
    }

}

exports.saveWorkAssignments = async (req, res) => {
    const { kiosztasok } = req.body; 
    
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (const feladatId in kiosztasok) {
                const munkasok = kiosztasok[feladatId];

                // 1. Lekérjük a dátumot a feladathoz egyszer (hogy ne a belső ciklusban kelljen)
                const dateResult = await transaction.request()
                    .input('fId', sql.Int, feladatId)
                    .query(`
                        SELECT TOP 1 f.KezdesDatuma 
                        FROM Felujitas f 
                        JOIN Feladat ft ON f.FelujitasId = ft.FelujitasId 
                        WHERE ft.FeladatId = @fId
                    `);
                
                const feladatDatuma = dateResult.recordset[0]?.KezdesDatuma;

                for (const szakemberId of munkasok) {
                    // 2. Beillesztés a Munkakiosztas táblába
                    await transaction.request()
                        .input('feladatId', sql.Int, feladatId)
                        .input('szakemberId', sql.Int, szakemberId)
                        .input('datum', sql.DateTime, feladatDatuma)
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM Munkakiosztas WHERE FeladatId = @feladatId AND SzakemberId = @szakemberId)
                            BEGIN
                                INSERT INTO Munkakiosztas (FeladatId, SzakemberId, Statusz, MunkaDatuma)
                                VALUES (@feladatId, @szakemberId, 'Kiosztva', @datum)
                            END
                        `);
                }
            }
            await transaction.commit();
            res.json({ message: "Beosztások sikeresen mentve!" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Mentési hiba részletei:", err.message);
        res.status(500).json({ error: "Szerver hiba a mentés során.", details: err.message });
    }
};
