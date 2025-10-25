const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
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
router.post('/categories', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.createCategory);
router.put('/categories/:id', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.updateCategory);
router.delete('/categories/:id', roleMiddleware.restrictTo('admin'), inventoryController.deleteCategory);

// ================================
// ITEMS
// ================================
router.get('/items', inventoryController.getItems);
router.get('/items/:id', inventoryController.getItem);
router.post('/items', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.createItem);
router.put('/items/:id', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.updateItem);
router.delete('/items/:id', roleMiddleware.restrictTo('admin'), inventoryController.deleteItem);

// ================================
// TRANSACTIONS
// ================================
router.get('/transactions', inventoryController.getTransactions);
router.post('/transactions', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.createTransaction);

// ================================
// ALLOCATIONS
// ================================
router.get('/allocations', inventoryController.getAllocations);
router.get('/allocations/:id', inventoryController.getAllocation);
router.post('/allocations', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.createAllocation);
router.put('/allocations/:id', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.updateAllocation);
router.delete('/allocations/:id', roleMiddleware.restrictTo('admin', 'staff'), inventoryController.deleteAllocation);

module.exports = router;
