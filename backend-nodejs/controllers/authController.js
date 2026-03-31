const { poolPromise, sql } = require('../config/dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ERVENYES_TELEFON_ELOHIVOK = new Set(['20', '30', '50', '70']);
const TELEFONSZAM_ELOHIVO_HIBA = 'A telefonszám előhívója nem megfelelő. Csak +36 20, +36 30, +36 50 vagy +36 70 kezdetű szám adható meg.';

const normalizaltMagyarTelefonszam = (telefonszam) => {
    const nyersSzamjegyek = String(telefonszam || '').replace(/\D/g, '');
    let normalizaltSzamjegyek = nyersSzamjegyek;

    if (normalizaltSzamjegyek.startsWith('06')) {
        normalizaltSzamjegyek = '36' + normalizaltSzamjegyek.slice(2);
    } else if (!normalizaltSzamjegyek.startsWith('36')) {
        normalizaltSzamjegyek = '36' + normalizaltSzamjegyek.replace(/^0+/, '');
    }

    if (normalizaltSzamjegyek.length !== 11) {
        return { error: 'A telefonszámnak +36-tal együtt 11 számjegyűnek kell lennie.' };
    }

    const szolgaltatoiElohivo = normalizaltSzamjegyek.slice(2, 4);
    if (!ERVENYES_TELEFON_ELOHIVOK.has(szolgaltatoiElohivo)) {
        return { error: TELEFONSZAM_ELOHIVO_HIBA };
    }

    return { value: `+${normalizaltSzamjegyek}` };
};

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

        const normalizaltTelefonszam = normalizaltMagyarTelefonszam(telefon);
        if (normalizaltTelefonszam.error) {
            return res.status(400).json({ message: normalizaltTelefonszam.error });
        }
        telefon = normalizaltTelefonszam.value;

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

        const normalizaltTelefonszam = normalizaltMagyarTelefonszam(phone);
        if (normalizaltTelefonszam.error) {
            return res.status(400).json({ message: normalizaltTelefonszam.error });
        }

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
            .input('tel', sql.NVarChar, normalizaltTelefonszam.value)
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
        res.json({ id: userId, name, email, phone: normalizaltTelefonszam.value });
    } catch (err) {
        console.error('updateProfile hiba:', err);
        res.status(500).json({ error: 'Szerverhiba a profil frissítése közben.' });
    }
};