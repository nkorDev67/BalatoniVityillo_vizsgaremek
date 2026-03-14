const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { route } = require('./adminRoutes');

// nur for admins
router.get('/workers', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getProfessionals);
router.post('/workers', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.addWorkerByEmail);
// kirúgás / visszafokozás
router.delete('/workers/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.removeWorker);
router.get('/requests', adminController.getAllRequestsWithTasks);

//Felujitaskárás mentés
router.put('/update-status', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateStatus);


//Beosztás kezelő
router.get('/tasks-to-assign', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getTaskForAssigments);
router.post('/save-assignments', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.saveWorkAssignments);
module.exports = router;
