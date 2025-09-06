const express = require('express');
const router = express.Router();
const reportCardController = require('../controllers/reportCardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// ================================
// REPORT CARD TEMPLATES ROUTES
// ================================

// Get all templates for school
router.get('/templates', reportCardController.getTemplates);

// Get template by ID
router.get('/templates/:templateId', reportCardController.getTemplateById);

// Create new template (Admin/Teacher only)
router.post('/templates', 
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'), 
  reportCardController.createTemplate
);

// Update template (Admin/Teacher only)
router.put('/templates/:templateId', 
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'), 
  reportCardController.updateTemplate
);

// Delete template (Admin only)
router.delete('/templates/:templateId', 
  roleMiddleware.restrictTo('ADMIN'), 
  reportCardController.deleteTemplate
);

// ================================
// REPORT CARD GENERATION ROUTES
// ================================

// Generate report card for individual student
router.post('/generate/student/:studentId',
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'),
  reportCardController.generateStudentReport
);

// Generate report cards for entire class (bulk)
router.post('/generate/class/:classId',
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'),
  reportCardController.generateClassReports
);

// Get batch processing status
router.get('/batch/:batchId/status',
  reportCardController.getBatchStatus
);

// Get all batches for school
router.get('/batches',
  reportCardController.getAllBatches
);

// ================================
// REPORT CARD RETRIEVAL ROUTES
// ================================

// Get report cards for a student
router.get('/student/:studentId',
  reportCardController.getStudentReports
);

// Get report cards for a class
router.get('/class/:classId',
  reportCardController.getClassReports
);

// ================================
// REPORT CARD MANAGEMENT ROUTES
// ================================

// Approve report card (Admin/Teacher only)
router.post('/:reportId/approve',
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'),
  reportCardController.approveReport
);

// Publish report card (Admin only)
router.post('/:reportId/publish',
  roleMiddleware.restrictTo('ADMIN'),
  reportCardController.publishReport
);

// Generate PDF for report card
router.get('/:reportId/pdf',
  reportCardController.generatePDF
);

module.exports = router;
