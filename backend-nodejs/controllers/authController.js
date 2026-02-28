const { poolPromise, sql } = require('../config/dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISZTRÁCIÓ
exports.register = async (req, res) => {
    try {
        const { felhasznalonev, email, jelszo, telefon } = req.body;
        const pool = await poolPromise;

        // Jelszó titkosítása (hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(jelszo, salt);

        // Mentés az SQL-be
        await pool.request()
            .input('nev', sql.NVarChar, felhasznalonev)
            .input('email', sql.NVarChar, email)
            .input('tel', sql.NVarChar, telefon)
            .input('pw', sql.NVarChar, hashedPw)
            .query(`INSERT INTO Felhasznalo (Felhasznalonev, Email, TelefonSzam, Jelszo) 
                    VALUES (@nev, @email, @tel, @pw)`);

        res.status(201).json({ message: "Sikeres regisztráció!" });
    } catch (err) {
        res.status(500).json({ error: "Hiba: " + err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { login_identity, pw } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.NVarChar, login_identity)
            .query('SELECT * FROM Felhasznalo WHERE Email = @email');

        const user = result.recordset[0];

        if (!user) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

        // Titkosított jelszó ellenőrzése
        const isMatch = await bcrypt.compare(pw, user.Jelszo);
        if (!isMatch) return res.status(401).json({ message: "Hibás email vagy jelszó!" });

        // Token generálása - beletesszük az ID-t és a JOGOT
        const token = jwt.sign(
            { id: user.FelhasznaloId, jog: user.Jogosultsag },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

       res.json({ 
            token, 
            role: user.Jogosultsag, 
            user: { 
                id: user.FelhasznaloId, 
                nev: user.Felhasznalonev, 
                jog: user.Jogosultsag 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Szerverhiba a belépésnél." });
    }
};