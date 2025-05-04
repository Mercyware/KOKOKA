const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private (Admin, Teacher)
router.get(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.getAllExams
);

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Private (Admin, Teacher, Student)
router.get(
  '/:id',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  examController.getExamById
);

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Admin, Teacher)
router.post(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.createExam
);

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Admin, Teacher)
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.updateExam
);

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Admin)
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  examController.deleteExam
);

// @route   GET /api/exams/class/:classId
// @desc    Get exams by class
// @access  Private (Admin, Teacher, Student)
router.get(
  '/class/:classId',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  examController.getExamsByClass
);

// @route   POST /api/exams/results
// @desc    Submit exam results
// @access  Private (Admin, Teacher)
router.post(
  '/results',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.submitExamResults
);

// @route   GET /api/exams/:examId/report
// @desc    Generate exam report
// @access  Private (Admin, Teacher)
router.get(
  '/:examId/report',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.generateExamReport
);

module.exports = router;
