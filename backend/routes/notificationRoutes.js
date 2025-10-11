const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const schoolMiddleware = require('../middlewares/schoolMiddleware');

// Controllers
const {
  sendNotification,
  getNotifications,
  getNotification,
  cancelNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  getPreferences,
  updatePreferences,
  resetPreferences,
  getPreferencesSummary
} = require('../controllers/notificationController');

// Apply middleware to all routes
router.use(authMiddleware.protect);

// =================================
// NOTIFICATION ROUTES
// =================================

/**
 * @desc    Send notification
 * @route   POST /api/notifications
 * @access  Private (Admin, Principal, Teacher, Staff)
 */
router.post(
  '/',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF'),
  sendNotification
);

/**
 * @desc    Get notifications (admin view)
 * @route   GET /api/notifications
 * @access  Private (Admin, Principal)
 */
router.get(
  '/',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  getNotifications
);

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  Private (Admin, Principal)
 */
router.get(
  '/stats',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  getNotificationStats
);

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications/user/me
 * @access  Private
 */
router.get('/user/me', getUserNotifications);

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/notifications/read-all
 * @access  Private
 */
router.post('/read-all', markAllAsRead);

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
router.put('/preferences', updatePreferences);

/**
 * @desc    Reset preferences to defaults
 * @route   POST /api/notifications/preferences/reset
 * @access  Private
 */
router.post('/preferences/reset', resetPreferences);

/**
 * @desc    Get preferences summary for school
 * @route   GET /api/notifications/preferences/summary
 * @access  Private (Admin, Principal)
 */
router.get(
  '/preferences/summary',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  getPreferencesSummary
);

/**
 * @desc    Get single notification
 * @route   GET /api/notifications/:id
 * @access  Private
 */
router.get('/:id', getNotification);

/**
 * @desc    Mark notification as read
 * @route   POST /api/notifications/:id/read
 * @access  Private
 */
router.post('/:id/read', markAsRead);

/**
 * @desc    Cancel scheduled notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Admin, Creator)
 */
router.delete('/:id', cancelNotification);

// =================================
// TEMPLATE ROUTES
// =================================

/**
 * @desc    Create notification template
 * @route   POST /api/notifications/templates
 * @access  Private (Admin, Principal)
 */
router.post(
  '/templates',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  createTemplate
);

/**
 * @desc    Get notification templates
 * @route   GET /api/notifications/templates
 * @access  Private
 */
router.get('/templates', getTemplates);

/**
 * @desc    Get single template
 * @route   GET /api/notifications/templates/:id
 * @access  Private
 */
router.get('/templates/:id', getTemplate);

/**
 * @desc    Preview template
 * @route   GET /api/notifications/templates/:id/preview
 * @access  Private
 */
router.get('/templates/:id/preview', previewTemplate);

/**
 * @desc    Update notification template
 * @route   PUT /api/notifications/templates/:id
 * @access  Private (Admin, Principal)
 */
router.put(
  '/templates/:id',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  updateTemplate
);

/**
 * @desc    Delete notification template
 * @route   DELETE /api/notifications/templates/:id
 * @access  Private (Admin, Principal)
 */
router.delete(
  '/templates/:id',
  roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  deleteTemplate
);

module.exports = router;