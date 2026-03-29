const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', authController.login)
router.post('/bejelentkezes', authController.login)
router.post('/register', authController.register)
router.post('/regisztracio', authController.register)

// Lekéri a jelenleg bejelentkezett felhasználó adatait
router.get('/me', authMiddleware.verifyToken, authController.getProfile)
router.get('/profilom', authMiddleware.verifyToken, authController.getProfile)
router.put('/me', authMiddleware.verifyToken, authController.updateProfile)
router.put('/profilom', authMiddleware.verifyToken, authController.updateProfile)

module.exports = router;