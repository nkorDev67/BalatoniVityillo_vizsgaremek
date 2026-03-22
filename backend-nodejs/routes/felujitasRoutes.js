const express = require('express')
const router = express.Router();
const felujitasController = require('../controllers/felujitasController')
const {verifyToken} = require('../middleware/authMiddleware');

router.post('/request', verifyToken, felujitasController.createRequest);
router.get('/my-requests', verifyToken, felujitasController.getMyRequests);


router.get('/details/:id', verifyToken, felujitasController.getRequestDetails)

module.exports = router