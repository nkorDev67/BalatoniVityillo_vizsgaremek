require('dotenv').config();
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const felujitasRoutes = require('./routes/felujitasRoutes')
const beosztasRoutes = require('./routes/beosztasRoutes')
const app = express()

app.use(cors())
app.use(express.json())

// általános útvonalak
app.use('/api/felujitas', felujitasRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/beosztas', beosztasRoutes)

// Új végpont: minden beosztás listázása, a hozzá rendelt szakemberhez tartozó munkákat jelöljük
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('./config/dbconfig');

app.get('/api/beosztas/assignments', async (req, res) => {
  try {
    let userId = 0;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded?.id || 0;
      } catch {
        userId = 0;
      }
    }

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

    res.json(result.recordset);
  } catch (err) {
    console.error('assignments endpoint hiba:', err);
    res.status(500).json({ error: err.message || 'Hiba a beosztások lekérésekor.' });
  }
});

// admin-specifikus végpontok (ellenőrizni fogjuk a token->isAdmin közben)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes)

// Tesztútvonal a gyors ellenőrzéshez
app.get('/test', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server fut: http://localhost:${PORT}`);
});

