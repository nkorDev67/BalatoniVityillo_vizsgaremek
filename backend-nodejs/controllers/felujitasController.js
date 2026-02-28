const { pool } = require('mssql');
const {poolPromise, sql} = require('../config/dbconfig');

exports.createRequest = async (req, res) => {
    const {helyszinCim, feladatok, leiras} = req.body;
    const felhasznaloId= req.user.id;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try{
        await transaction.begin();

        const felujitasResult = await transaction.request()
        .input('uId', sql.Int, felhasznaloId)
        .input('cim', sql.NVarChar, helyszinCim)
        .input('leiras', sql.NVarChar, leiras)
        .query(`INSERT INTO Felujitas (FelhasznaloId, HelyszinCim, Leiras, Statusz)
            OUTPUT INSERTED.FelujitasId
            VALUES (@uId, @cim, @leiras, 'Feldolgozás alatt')`);

        const newId = felujitasResult.recordset[0].FelujitasId;

        for (const f of feladatok){
            await transaction.request()
                .input('fId', sql.Int, newId)
                .input('tipus', sql.NVarChar, f.tipus)
                .input('terulet', sql.Int, f.terulet)
                .input('ar', sql.Decimal(18,2), f.ar)
                .query(`INSERT INTO Feladat (FelujitasId, Tipus, Terulet, Ar)
                    VALUES (@fId, @tipus, @terulet, @ar)`);
        }

        await transaction.commit();
        res.status(201).json({massage: "Sikeres mentés, az Admin látni fogja", id: newId});

    } catch (err) {
        await transaction.rollback();
        console.error("Hiba a mentésnél:", err);
        res.status(500).json({ error: "Szerverhiba a kérés beküldésekor." });
    

    } 
}