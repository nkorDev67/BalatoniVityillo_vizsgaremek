const { poolPromise, sql } = require('../config/dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISZTRÁCIÓ
exports.register = async (req, res) => {
    try {
        let { felhasznalonev, email, jelszo, telefon } = req.body;

        // alapvető validációk
        if (!felhasznalonev || !email || !jelszo || !telefon) {
            return res.status(400).json({ message: 'Minden mező kitöltése kötelező.' });
        }

        // email ellenőrzés
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ message: 'Helytelen email formátum.' });
        }

        // jelszó ellenőrzés
        if (jelszo.length < 4 || !/\d/.test(jelszo)) {
            return res.status(400).json({ message: 'A jelszónak legalább 4 karakter hosszúnak kell lennie és tartalmaznia kell számot.' });
        }

        // telefonszám normalizálása: ha nem +36-tal kezdődik, hozzáadjuk
        if (!telefon.startsWith('+36')) {
            telefon = '+36' + telefon.replace(/[^0-9]/g, '');
        }
        // ellenőrizzük a hosszát (pl. +36 után 9 számjegy)
        const digits = telefon.replace(/\D/g, '');
        if (digits.length !== 11) { // +36 + 9 számjegy = 11 szám
            return res.status(400).json({ message: 'A telefonszámnak +36-tal együtt 11 számjegyűnek kell lennie.' });
        }

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

// Visszaadja a jelenleg bejelentkezett felhasználó adatait (token alapján)
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Bejelentkezés szükséges.' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT FelhasznaloId, Felhasznalonev, Email, TelefonSzam, Jogosultsag FROM Felhasznalo WHERE FelhasznaloId = @id');

        const user = result.recordset[0];
        if (!user) return res.status(404).json({ message: 'Felhasználó nem található.' });

        res.json({
            id: user.FelhasznaloId,
            name: user.Felhasznalonev,
            email: user.Email,
            phone: user.TelefonSzam,
            role: user.Jogosultsag
        });
    } catch (err) {
        console.error('getProfile hiba:', err);
        res.status(500).json({ error: 'Szerverhiba a profil lekérdezése közben.' });
    }
};

// Frissíti a jelenlegi felhasználó adatait: név, email, telefon, opcionálisan jelszó.
// A frissítéshez meg kell adni a jelenlegi jelszót (currentPassword).
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Bejelentkezés szükséges.' });

        const { name, email, phone, currentPassword, newPassword } = req.body;
        if (!currentPassword) return res.status(400).json({ message: 'A jelenlegi jelszó megadása kötelező a módosításhoz.' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT Jelszo FROM Felhasznalo WHERE FelhasznaloId = @id');

        const user = result.recordset[0];
        if (!user) return res.status(404).json({ message: 'Felhasználó nem található.' });

        const isMatch = await bcrypt.compare(currentPassword, user.Jelszo);
        if (!isMatch) return res.status(401).json({ message: 'A megadott jelszó nem egyezik.' });

        // Elkészítjük az UPDATE lekérdezést
        const reqUpdate = pool.request()
            .input('nev', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('tel', sql.NVarChar, phone)
            .input('id', sql.Int, userId);

        let updateQuery = 'UPDATE Felhasznalo SET Felhasznalonev = @nev, Email = @email, TelefonSzam = @tel';

        if (newPassword && newPassword.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(newPassword, salt);
            reqUpdate.input('pw', sql.NVarChar, hashed);
            updateQuery += ', Jelszo = @pw';
        }

        updateQuery += ' WHERE FelhasznaloId = @id';

        await reqUpdate.query(updateQuery);

        // Visszaadjuk a frissített adatokat
        res.json({ id: userId, name, email, phone });
    } catch (err) {
        console.error('updateProfile hiba:', err);
        res.status(500).json({ error: 'Szerverhiba a profil frissítése közben.' });
    }
};