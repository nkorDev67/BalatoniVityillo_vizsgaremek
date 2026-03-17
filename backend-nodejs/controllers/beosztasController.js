const { poolPromise, sql } = require('../config/dbconfig');
const jwt = require('jsonwebtoken');

async function fetchAssignments(userId = 0) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT
                mk.SzakemberId,
                ISNULL(fs.Felhasznalonev, 'Ismeretlen') AS SzakemberNev,
                mk.FeladatId,
                mk.Statusz,
                mk.MunkaDatuma,
                ISNULL(f.Tipus, 'N/A') AS FeladatTipus,
                ISNULL(f.Terulet, 0) AS Terulet,
                ISNULL(f.Ar, 0) AS Ar,
                ISNULL(fel.HelyszinCim, 'N/A') AS HelyszinCim,
                ISNULL(fel.Leiras, 'N/A') AS Leiras,
                ISNULL(fel.KezdesDatuma, NULL) AS KezdesDatuma,
                CASE WHEN @userId > 0 AND mk.SzakemberId = @userId THEN 1 ELSE 0 END AS AssignedToMe
            FROM [VityilloDB].[dbo].[MunkaKiosztas] mk
            LEFT JOIN [VityilloDB].[dbo].[Feladat] f ON mk.FeladatId = f.FeladatId
            LEFT JOIN [VityilloDB].[dbo].[Felujitas] fel ON f.FelujitasId = fel.FelujitasId
            ORDER BY mk.MunkaDatuma DESC
        `);
    return result.recordset;
}

async function fetchAssignmentsBySzakember(szakemberId = 0) {
    if (!szakemberId) return [];
    const pool = await poolPromise;
    const result = await pool.request()
        .input('szid', sql.Int, szakemberId)
        .query(`
            SELECT
                mk.SzakemberId,
                ISNULL(fs.Felhasznalonev, 'Ismeretlen') AS SzakemberNev,
                mk.FeladatId,
                mk.Statusz,
                mk.MunkaDatuma,
                ISNULL(f.Tipus, 'N/A') AS FeladatTipus,
                ISNULL(f.Terulet, 0) AS Terulet,
                ISNULL(f.Ar, 0) AS Ar,
                ISNULL(fel.HelyszinCim, 'N/A') AS HelyszinCim,
                ISNULL(fel.Leiras, 'N/A') AS Leiras,
                ISNULL(fel.KezdesDatuma, NULL) AS KezdesDatuma,
                1 AS AssignedToMe
            FROM MunkaKiosztas mk
            LEFT JOIN Feladat f ON mk.FeladatId = f.FeladatId
            LEFT JOIN Felujitas fel ON f.FelujitasId = fel.FelujitasId
            LEFT JOIN Szakember s ON mk.SzakemberId = s.SzakemberId
            LEFT JOIN Felhasznalo fs ON s.FelhasznaloId = fs.FelhasznaloId
            WHERE mk.SzakemberId = @szid
            ORDER BY mk.MunkaDatuma DESC
        `);
    return result.recordset;
}

async function getUserNameById(userId = 0) {
    if (!userId) return null;
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, userId)
        .query(`SELECT Felhasznalonev FROM Felhasznalo WHERE FelhasznaloId = @id`);
    return result.recordset[0]?.Felhasznalonev ?? null;
}

exports.getAssignments = async (req, res) => {
    try {
        let userId = 0;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded?.id ?? 0;
            } catch (err) {
                // érvénytelen token esetén nem dobunk hibát
                userId = 0;
            }
        }

        const assignments = await fetchAssignments(userId);
        const myName = await getUserNameById(userId);
        res.json({ userName: myName, assignments });
    } catch (err) {
        console.error("getAssignments hiba:", err);
        res.status(500).json({ error: err.message || "Szerverhiba a munka kiosztás lekérdezésekor." });
    }
};

// Csak a bejelentkezett felhasználóhoz rendelt beosztások
exports.getMyAssignments = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Bejelentkezés szükséges." });

        // Először megtaláljuk, hogy ennek a felhasználónak van-e Szakember rekordja
        const pool = await poolPromise;
        const szakRes = await pool.request()
            .input('fid', sql.Int, userId)
            .query('SELECT SzakemberId FROM Szakember WHERE FelhasznaloId = @fid');
        const szakemberId = szakRes.recordset[0]?.SzakemberId;
        if (!szakemberId) return res.json([]); // nem szakember, nincs beosztás

        const myAssignments = await fetchAssignmentsBySzakember(szakemberId);
        res.json(myAssignments);
    } catch (err) {
        console.error("getMyAssignments hiba:", err);
        res.status(500).json({ error: err.message || "Szerverhiba a munka kiosztás lekérdezésekor." });
    }
};

// Egyszerűsített lekérdezés: a bejelentkezett felhasználóhoz tartozó szakember munkái
exports.getMyTasks = async (req, res) => {
    try {
        const pool = await poolPromise;
        // A req.user.id-t a JWT tokenből vesszük ki (amit a login-nál kapott)
        const felhasznaloId = req.user.id;

        const result = await pool.request()
            .input('fId', sql.Int, felhasznaloId)
            .query(`
                SELECT 
                    f.HelyszinCim AS helyszin,
                    ft.Tipus AS feladatTipus,
                    mk.MunkaDatuma AS datum,
                    mk.Statusz AS statusz
                FROM Munkakiosztas mk
                JOIN Feladat ft ON mk.FeladatId = ft.FeladatId
                JOIN Felujitas f ON ft.FelujitasId = f.FelujitasId
                JOIN Szakember sz ON mk.SzakemberId = sz.SzakemberId
                WHERE sz.FelhasznaloId = @fId -- A bejelentkezett júzer munkái
                ORDER BY mk.MunkaDatuma ASC
            `);

        res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Jelöli késznek a beosztott munkát a bejelentkezett szakember számára
exports.completeAssignment = async (req, res) => {
    try {
        const feladatId = parseInt(req.params.feladatId);
        const felhasznaloId = req.user?.id;
        if (!felhasznaloId) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
        if (!feladatId) return res.status(400).json({ error: 'Érvénytelen feladat azonosító.' });

        const pool = await poolPromise;
        // Megkeressük a szakember rekordot a bejelentkezett felhasználóhoz
        const szakRes = await pool.request()
            .input('fid', sql.Int, felhasznaloId)
            .query('SELECT SzakemberId FROM Szakember WHERE FelhasznaloId = @fid');
        const szakemberId = szakRes.recordset[0]?.SzakemberId;
        if (!szakemberId) return res.status(403).json({ error: 'Nincs jogosultságod befejezni ezt a munkát.' });

        // Naplózás a hibakereséshez
        console.log(`completeAssignment called: feladatId=${feladatId}, felhasznaloId=${felhasznaloId}, szakemberId=${szakemberId}`);

        // Próbáljuk meg frissíteni a lehetséges tábla neveken, mert a repo több helyen is eltérően hivatkozik rá
        const tablesToTry = ['Munkakiosztas', 'MunkaKiosztas'];
        let affected = 0;
        let triedTable = null;

        for (const tbl of tablesToTry) {
            const q = `UPDATE ${tbl} SET Statusz = @statusz WHERE FeladatId = @feladatId AND SzakemberId = @szid`;
            const updateRes = await pool.request()
                .input('feladatId', sql.Int, feladatId)
                .input('szid', sql.Int, szakemberId)
                .input('statusz', sql.NVarChar, 'Befejezve')
                .query(q);
            affected = updateRes.rowsAffected ? updateRes.rowsAffected[0] : 0;
            console.log(`Tried update on ${tbl}, rowsAffected=${affected}`);
            triedTable = tbl;
            if (affected > 0) break;
        }

        if (affected === 0) {
            return res.status(404).json({ error: 'A megadott kiosztás nem található vagy nincs jogosultságod.', triedTable });
        }

        res.json({ success: true, message: 'A munka befejezve.', triedTable });
    } catch (err) {
        console.error('completeAssignment hiba:', err);
        res.status(500).json({ error: err.message || 'Szerverhiba.' });
    }
};
