const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const gradeScaleController = require('../controllers/gradeScaleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Grade Scale routes
router.post('/grade-scales', protect, authorize(['ADMIN', 'PRINCIPAL']), gradeScaleController.createGradeScale);
router.get('/grade-scales/active', protect, gradeScaleController.getActiveGradeScale);
router.get('/grade-scales/defaults', protect, gradeScaleController.getDefaultGradeScales);
router.get('/grade-scales', protect, gradeScaleController.getAllGradeScales);
router.put('/grade-scales/:id', protect, authorize(['ADMIN', 'PRINCIPAL']), gradeScaleController.updateGradeScale);
router.put('/grade-scales/:id/activate', protect, authorize(['ADMIN', 'PRINCIPAL']), gradeScaleController.setActiveGradeScale);
router.delete('/grade-scales/:id', protect, authorize(['ADMIN', 'PRINCIPAL']), gradeScaleController.deleteGradeScale);

// Result routes
router.post('/', protect, authorize(['ADMIN', 'PRINCIPAL', 'TEACHER']), resultController.createOrUpdateResult);
router.get('/student/:studentId/term/:termId', protect, resultController.getStudentResult);
router.get('/class/:classId/term/:termId', protect, resultController.getClassResults);
router.get('/class/:classId/term/:termId/summary', protect, resultController.getResultSummary);
router.post('/publish', protect, authorize(['ADMIN', 'PRINCIPAL']), resultController.publishResults);
router.get('/report-card/:studentId/:termId', protect, resultController.generateReportCard);
router.get('/terminal-report/:studentId/:termId', protect, resultController.getTerminalReport);

module.exports = router;