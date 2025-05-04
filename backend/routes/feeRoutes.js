const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

// @route   GET /api/fees
// @desc    Get all fees
// @access  Private (Admin)
router.get(
  '/',
  roleMiddleware.restrictTo('admin'),
  feeController.getAllFees
);

// @route   GET /api/fees/:id
// @desc    Get fee by ID
// @access  Private (Admin, Own Student)
router.get(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin']),
  feeController.getFeeById
);

// @route   POST /api/fees
// @desc    Create new fee record
// @access  Private (Admin)
router.post(
  '/',
  roleMiddleware.restrictTo('admin'),
  feeController.createFee
);

// @route   PUT /api/fees/:id
// @desc    Update fee record
// @access  Private (Admin)
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  feeController.updateFee
);

// @route   DELETE /api/fees/:id
// @desc    Delete fee record
// @access  Private (Admin)
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  feeController.deleteFee
);

// @route   GET /api/fees/student/:studentId
// @desc    Get fees by student
// @access  Private (Admin, Own Student)
router.get(
  '/student/:studentId',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin']),
  feeController.getFeesByStudent
);

// @route   POST /api/fees/payment
// @desc    Record fee payment
// @access  Private (Admin)
router.post(
  '/payment',
  roleMiddleware.restrictTo('admin'),
  feeController.recordPayment
);

// @route   GET /api/fees/report
// @desc    Generate fee report
// @access  Private (Admin)
router.get(
  '/report',
  roleMiddleware.restrictTo('admin'),
  feeController.generateFeeReport
);

module.exports = router;
