const express = require('express');
const router = express.Router();
const reportCardController = require('../controllers/reportCardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// ================================
// REPORT CARD ROUTES
// ================================

// Get report card for a student for a term
router.get('/student/:studentId/term/:termId',
  reportCardController.generateReportCard
);

// Get all report cards for a student
router.get('/student/:studentId',
  reportCardController.getStudentReports
);

// Get report cards for a class (requires termId query param)
router.get('/class/:classId',
  reportCardController.getClassReports
);

// Get published results
router.get('/published',
  reportCardController.getPublishedResults
);

// Generate PDF for a report card
router.get('/student/:studentId/term/:termId/pdf',
  reportCardController.generatePDF
);

// Publish report cards for a term (Admin/Teacher only)
router.post('/publish',
  roleMiddleware.restrictTo('ADMIN', 'TEACHER'),
  reportCardController.publishReports
);

module.exports = router;
