exports.getAllRequests = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                f.FelujitasId, 
                f.HelyszinCim, 
                f.Statusz, 
                f.Leiras, 
                f.LetrehozasDatuma,
                u.Felhasznalonev AS UgyfelNeve,
                (SELECT SUM(Ar) FROM Feladat WHERE FelujitasId = f.FelujitasId) AS OsszAr
            FROM Felujitas f
            JOIN Felhasznalo u ON f.FelhasznaloId = u.FelhasznaloId
            ORDER BY f.LetrehozasDatuma DESC
        `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Hiba az adatok lekérésekor." });
    }
};