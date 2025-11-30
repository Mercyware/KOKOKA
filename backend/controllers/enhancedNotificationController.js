const NotificationService = require('../services/notifications/NotificationService');
const NotificationRulesEngine = require('../services/notifications/NotificationRulesEngine');
const logger = require('../utils/logger');

/**
 * Send enhanced notification (with rules engine)
 */
exports.sendEnhancedNotification = async (req, res) => {
  try {
    const result = await NotificationService.sendNotification(req.body);

    if (!result) {
      return res.json({
        success: true,
        message: 'Notification blocked by rules engine',
        blocked: true,
      });
    }

    res.status(201).json({
      success: true,
      data: result.notification,
      delivery: result.deliveryResults,
    });
  } catch (error) {
    logger.error(`Error sending enhanced notification: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await NotificationService.getUserNotifications(userId, req.query);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        unreadCount: result.unreadCount,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    logger.error(`Error fetching user notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await NotificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error(`Error marking as read: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    });
  } catch (error) {
    logger.error(`Error marking all as read: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await NotificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Bulk send notifications
 */
exports.bulkSendNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notifications array is required',
      });
    }

    const result = await NotificationService.bulkSendNotifications(notifications);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error bulk sending notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send to multiple users
 */
exports.sendToMultipleUsers = async (req, res) => {
  try {
    const { userIds, notification } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (!notification) {
      return res.status(400).json({
        success: false,
        message: 'Notification data is required',
      });
    }

    const result = await NotificationService.sendToMultipleUsers(userIds, notification);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error sending to multiple users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send daily digest
 */
exports.sendDailyDigest = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await NotificationService.sendDailyDigest(userId);

    if (!result) {
      return res.json({
        success: true,
        message: 'No notifications for digest',
      });
    }

    res.json({
      success: true,
      message: `Digest sent with ${result.count} notifications`,
      data: result,
    });
  } catch (error) {
    logger.error(`Error sending daily digest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get notification statistics
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const stats = await NotificationService.getNotificationStats(userId, days);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching notification stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== NOTIFICATION RULES ====================

/**
 * Create notification rule
 */
exports.createRule = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const rule = await NotificationRulesEngine.createRule({
      ...req.body,
      schoolId,
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    logger.error(`Error creating notification rule: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get active rules
 */
exports.getActiveRules = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const rules = await NotificationRulesEngine.getActiveRules(schoolId);

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    logger.error(`Error fetching active rules: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Evaluate rules for event
 */
exports.evaluateRulesForEvent = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const notifications = await NotificationRulesEngine.evaluateRulesForEvent({
      ...req.body,
      schoolId,
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    logger.error(`Error evaluating rules: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user notification preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await NotificationRulesEngine.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error(`Error fetching user preferences: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update user notification preferences
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: req.body,
      },
      select: {
        notificationPreferences: true,
      },
    });

    res.json({
      success: true,
      data: updated.notificationPreferences,
    });
  } catch (error) {
    logger.error(`Error updating user preferences: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Batch notifications for digest
 */
exports.batchForDigest = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || 'DAILY';

    const grouped = await NotificationRulesEngine.batchNotificationsForDigest(
      userId,
      timeframe
    );

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    logger.error(`Error batching for digest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
