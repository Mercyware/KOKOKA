const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const schoolMiddleware = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(schoolMiddleware.requireSchool);

// ================================
// DASHBOARD & STATS
// ================================
router.get('/dashboard', inventoryController.getDashboardStats);

// ================================
// CATEGORIES
// ================================
router.get('/categories', inventoryController.getCategories);
router.get('/categories/:id', inventoryController.getCategory);
router.post('/categories', inventoryController.createCategory);
router.put('/categories/:id', inventoryController.updateCategory);
router.delete('/categories/:id', inventoryController.deleteCategory);

// ================================
// ITEMS
// ================================
router.get('/items', inventoryController.getItems);
router.get('/items/:id', inventoryController.getItem);
router.post('/items', inventoryController.createItem);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// ================================
// TRANSACTIONS
// ================================
router.get('/transactions', inventoryController.getTransactions);
router.post('/transactions', inventoryController.createTransaction);

// ================================
// ALLOCATIONS
// ================================
router.get('/allocations', inventoryController.getAllocations);
router.get('/allocations/:id', inventoryController.getAllocation);
router.post('/allocations', inventoryController.createAllocation);
router.put('/allocations/:id', inventoryController.updateAllocation);
router.delete('/allocations/:id', inventoryController.deleteAllocation);

module.exports = router;
