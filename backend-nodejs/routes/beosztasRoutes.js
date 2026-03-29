const express = require('express');
const router = express.Router();
const beosztasController = require('../controllers/beosztasController');
const { verifyToken } = require('../middleware/authMiddleware');

// Az összes munka megjelenítése. A "AssignedToMe" mező jelzi, hogy az adott felhasználóhoz van-e rendelve.
router.get('/assignments', beosztasController.getAssignments);
router.get('/osszes', beosztasController.getAssignments);

// (További endpointok maradtak, pl. csak a saját beosztás lekérése)
router.get('/my-assignments', verifyToken, beosztasController.getMyAssignments);
router.get('/sajat-beosztasok', verifyToken, beosztasController.getMyAssignments);
router.get('/my-tasks', verifyToken, beosztasController.getMyTasks);
router.get('/sajat-feladatok', verifyToken, beosztasController.getMyTasks);
// Szakember jelöli késznek a saját kiosztását
router.patch('/complete/:feladatId', verifyToken, beosztasController.completeAssignment);
router.patch('/befejezes/:feladatId', verifyToken, beosztasController.completeAssignment);

module.exports = router;