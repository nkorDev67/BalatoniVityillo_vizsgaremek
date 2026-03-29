const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// nur for admins
router.get('/workers', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getProfessionals);
router.get('/munkasok', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getProfessionals);
router.post('/workers', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.addWorkerByEmail);
router.post('/munkasok', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.addWorkerByEmail);
// kirúgás / visszafokozás
router.delete('/workers/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.removeWorker);
router.delete('/munkasok/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.removeWorker);
router.get('/requests', adminController.getAllRequestsWithTasks);
router.get('/kerelmek', adminController.getAllRequestsWithTasks);

//Felujitaskárás mentés
router.put('/update-status', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateStatus);
router.put('/statusz-frissites', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateStatus);


//Beosztás kezelő
router.get('/tasks-to-assign', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getTaskForAssigments);
router.get('/feladatok-kiosztashoz', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getTaskForAssigments);
router.post('/save-assignments', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.saveWorkAssignments);
router.post('/beosztasok-mentese', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.saveWorkAssignments);
module.exports = router;
