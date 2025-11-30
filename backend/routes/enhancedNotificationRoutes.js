const express = require('express');
const router = express.Router();
const enhancedNotificationController = require('../controllers/enhancedNotificationController');
const { protect } = require('../middlewares/authMiddleware');
const { requireSchool } = require('../middlewares/schoolMiddleware');

// All routes require authentication and school context
router.use(protect);
router.use(requireSchool);

// ==================== NOTIFICATION ROUTES ====================

// Send enhanced notification
router.post('/', enhancedNotificationController.sendEnhancedNotification);

// Get user notifications
router.get('/my-notifications', enhancedNotificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', enhancedNotificationController.markAsRead);

// Mark all as read
router.put('/read-all', enhancedNotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', enhancedNotificationController.deleteNotification);

// Bulk send notifications
router.post('/bulk', enhancedNotificationController.bulkSendNotifications);

// Send to multiple users
router.post('/send-multiple', enhancedNotificationController.sendToMultipleUsers);

// Send daily digest
router.post('/send-digest', enhancedNotificationController.sendDailyDigest);

// Get notification statistics
router.get('/stats', enhancedNotificationController.getNotificationStats);

// ==================== NOTIFICATION RULES ROUTES ====================

// Create notification rule
router.post('/rules', enhancedNotificationController.createRule);

// Get active rules
router.get('/rules', enhancedNotificationController.getActiveRules);

// Evaluate rules for event
router.post('/rules/evaluate', enhancedNotificationController.evaluateRulesForEvent);

// ==================== USER PREFERENCES ROUTES ====================

// Get user preferences
router.get('/preferences', enhancedNotificationController.getUserPreferences);

// Update user preferences
router.put('/preferences', enhancedNotificationController.updateUserPreferences);

// Batch notifications for digest
router.get('/digest/preview', enhancedNotificationController.batchForDigest);

module.exports = router;
