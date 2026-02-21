const jwt = require('jsonwebtoken');

// Ellenőrzi, hogy be van-e lépve (van-e érvényes tokenje)
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN kinyerése

    if (!token) return res.status(401).json({ message: "Bejelentkezés szükséges!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Betesszük a user adatokat a kérésbe
        next(); // Mehet tovább a kérés a controllerre
    } catch (err) {
        res.status(403).json({ message: "Érvénytelen vagy lejárt token!" });
    }
};

// Ellenőrzi, hogy ADMIN-e
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.jog === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Ehhez admin jogosultság kell!" });
    }
};