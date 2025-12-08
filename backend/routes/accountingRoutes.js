const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const { protect } = require('../middlewares/authMiddleware');
const { extractSchoolFromSubdomain } = require('../middlewares/schoolMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(extractSchoolFromSubdomain);

// ==================== CATEGORIES ====================
router.get('/categories', accountingController.getCategories);
router.post('/categories', accountingController.createCategory);

// ==================== INCOME TRANSACTIONS ====================
router.get('/income', accountingController.getIncomeTransactions);
router.post('/income', accountingController.createIncomeTransaction);

// ==================== EXPENDITURE TRANSACTIONS ====================
router.get('/expenditure', accountingController.getExpenditureTransactions);
router.post('/expenditure', accountingController.createExpenditureTransaction);
router.put('/expenditure/:id', accountingController.updateExpenditureTransaction);

// ==================== REPORTS & DASHBOARD ====================
router.get('/summary', accountingController.getAccountingSummary);

module.exports = router;
