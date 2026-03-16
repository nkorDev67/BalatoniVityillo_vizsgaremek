const { poolPromise, sql } = require('../config/dbconfig');
const jwt = require('jsonwebtoken');

async function fetchAssignments(userId = 0) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT
                mk.SzakemberId,
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

// Minden beosztás lekérése (kiírja az összeset, de csak a hozzád rendeltekkel lehet cselekedni)
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
        res.json(assignments);
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

        const assignments = await fetchAssignments(userId);
        const myAssignments = assignments.filter(a => a.SzakemberId === userId);
        res.json(myAssignments);
    } catch (err) {
        console.error("getMyAssignments hiba:", err);
        res.status(500).json({ error: err.message || "Szerverhiba a munka kiosztás lekérdezésekor." });
    }
};
