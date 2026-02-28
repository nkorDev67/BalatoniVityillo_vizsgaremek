const express = require('express')
const router = express.Router();
const felujitasController = require('../controllers/felujitasController')
const {verifyToken} = require('../middleware/authMiddleware');

router.post('/request', verifyToken, felujitasController.createRequest);

module.exports = router