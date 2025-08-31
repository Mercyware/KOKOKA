const asyncHandler = require('express-async-handler');
const notificationService = require('../services/notificationService');
const templateService = require('../services/templateService');
const notificationPreferencesService = require('../services/notificationPreferencesService');
const logger = require('../utils/logger');

/**
 * @desc    Send notification
 * @route   POST /api/notifications
 * @access  Private (Admin, Teacher, Staff)
 */
const sendNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type,
    priority = 'NORMAL',
    category = 'GENERAL',
    channels = ['IN_APP'],
    targetType,
    targetUsers = [],
    targetRoles = [],
    targetClasses = [],
    templateId = null,
    templateData = {},
    scheduledAt = null,
    expiresAt = null,
    metadata = {}
  } = req.body;

  // Validate required fields
  if (!title || !message || !type || !targetType) {
    return res.status(400).json({
      success: false,
      message: 'Title, message, type, and targetType are required'
    });
  }

  // Validate enum values
  const validTypes = ['SYSTEM', 'ACADEMIC', 'ATTENDANCE', 'EXAM_RESULT', 'FEE_REMINDER', 'ANNOUNCEMENT', 'EVENT', 'EMERGENCY', 'WELCOME', 'PASSWORD_RESET', 'GRADE_UPDATE', 'ASSIGNMENT', 'TIMETABLE_CHANGE', 'DISCIPLINARY', 'HEALTH', 'TRANSPORT', 'LIBRARY', 'CUSTOM'];
  const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];
  const validCategories = ['GENERAL', 'ACADEMIC', 'ADMINISTRATIVE', 'FINANCIAL', 'HEALTH', 'SAFETY', 'EVENTS', 'SYSTEM', 'PERSONAL'];
  const validChannels = ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK'];
  const validTargetTypes = ['ALL_USERS', 'SPECIFIC_USERS', 'ROLE_BASED', 'CLASS_BASED', 'COMBINED'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`
    });
  }

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
    });
  }

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
    });
  }

  if (!validTargetTypes.includes(targetType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid target type. Must be one of: ${validTargetTypes.join(', ')}`
    });
  }

  // Validate channels
  const invalidChannels = channels.filter(c => !validChannels.includes(c));
  if (invalidChannels.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid channels: ${invalidChannels.join(', ')}`
    });
  }

  try {
    const notificationData = {
      schoolId: req.school.id,
      title,
      message,
      type,
      priority,
      category,
      channels,
      targetType,
      targetUsers,
      targetRoles,
      targetClasses,
      templateId,
      templateData,
      scheduledAt,
      expiresAt,
      metadata,
      createdById: req.user.id
    };

    const result = await notificationService.sendNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = null,
      category = null,
      status = null,
      priority = null,
      createdBy = null,
      dateFrom = null,
      dateTo = null
    } = req.query;

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { schoolId: req.school.id };

    // Add filters
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (createdBy) where.createdById = createdBy;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          template: {
            select: { id: true, name: true, type: true }
          },
          deliveryLogs: {
            select: { channel: true, status: true, recipient: true }
          },
          userNotifications: {
            select: { isRead: true, isDelivered: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where })
    ]);

    // Add statistics to each notification
    const notificationsWithStats = notifications.map(notification => ({
      ...notification,
      stats: {
        totalTargets: notification.totalTargets,
        readCount: notification.readCount,
        deliveredCount: notification.userNotifications.filter(un => un.isDelivered).length,
        channelStats: notification.deliveryLogs.reduce((acc, log) => {
          acc[log.channel] = (acc[log.channel] || 0) + 1;
          return acc;
        }, {})
      }
    }));

    res.json({
      success: true,
      data: {
        notifications: notificationsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get single notification
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotification = asyncHandler(async (req, res) => {
  try {
    const notification = await notificationService.getNotification(req.params.id, req.school.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    logger.error('Error getting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Cancel scheduled notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Admin, Creator)
 */
const cancelNotification = asyncHandler(async (req, res) => {
  try {
    const notification = await notificationService.getNotification(req.params.id, req.school.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user can cancel this notification
    if (notification.createdById !== req.user.id && !['ADMIN', 'PRINCIPAL'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this notification'
      });
    }

    if (notification.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled notifications can be cancelled'
      });
    }

    await notificationService.cancelNotification(req.params.id, req.school.id);

    res.json({
      success: true,
      message: 'Notification cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications/user/me
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      unreadOnly = false,
      type = null,
      category = null
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type,
      category
    };

    const result = await notificationService.getUserNotifications(req.user.id, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Mark notification as read
 * @route   POST /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const result = await prisma.userNotification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`
    });

  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  Private (Admin)
 */
const getNotificationStats = asyncHandler(async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysAgo);

    const where = { schoolId: req.school.id, createdAt: { gte: dateFrom } };

    const [
      totalNotifications,
      sentNotifications,
      failedNotifications,
      readNotifications,
      typeStats,
      channelStats,
      priorityStats
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.aggregate({ where, _sum: { readCount: true } }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      prisma.notificationDeliveryLog.groupBy({
        by: ['channel'],
        where: { 
          notification: { schoolId: req.school.id },
          createdAt: { gte: dateFrom }
        },
        _count: { channel: true }
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        period: `${daysAgo} days`,
        summary: {
          total: totalNotifications,
          sent: sentNotifications,
          failed: failedNotifications,
          read: readNotifications._sum.readCount || 0,
          deliveryRate: totalNotifications > 0 ? ((sentNotifications / totalNotifications) * 100).toFixed(2) : 0,
          readRate: sentNotifications > 0 ? (((readNotifications._sum.readCount || 0) / sentNotifications) * 100).toFixed(2) : 0
        },
        breakdown: {
          byType: typeStats,
          byChannel: channelStats,
          byPriority: priorityStats
        }
      }
    });

  } catch (error) {
    logger.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Template Management

/**
 * @desc    Create notification template
 * @route   POST /api/notifications/templates
 * @access  Private (Admin)
 */
const createTemplate = asyncHandler(async (req, res) => {
  try {
    const template = await templateService.createTemplate({
      ...req.body,
      schoolId: req.school.id,
      createdById: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });

  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get notification templates
 * @route   GET /api/notifications/templates
 * @access  Private
 */
const getTemplates = asyncHandler(async (req, res) => {
  try {
    const result = await templateService.listTemplates({
      ...req.query,
      schoolId: req.school.id
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get single template
 * @route   GET /api/notifications/templates/:id
 * @access  Private
 */
const getTemplate = asyncHandler(async (req, res) => {
  try {
    const template = await templateService.getTemplate(req.params.id, req.school.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    logger.error('Error getting template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Update notification template
 * @route   PUT /api/notifications/templates/:id
 * @access  Private (Admin)
 */
const updateTemplate = asyncHandler(async (req, res) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body, req.school.id);

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });

  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Delete notification template
 * @route   DELETE /api/notifications/templates/:id
 * @access  Private (Admin)
 */
const deleteTemplate = asyncHandler(async (req, res) => {
  try {
    await templateService.deleteTemplate(req.params.id, req.school.id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Preview notification template
 * @route   GET /api/notifications/templates/:id/preview
 * @access  Private
 */
const previewTemplate = asyncHandler(async (req, res) => {
  try {
    const preview = await templateService.previewTemplate(req.params.id, req.school.id);

    res.json({
      success: true,
      data: preview
    });

  } catch (error) {
    logger.error('Error previewing template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Notification Preferences

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getPreferences = asyncHandler(async (req, res) => {
  try {
    const preferences = await notificationPreferencesService.getUserPreferences(req.user.id);

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    logger.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updatePreferences = asyncHandler(async (req, res) => {
  try {
    const preferences = await notificationPreferencesService.updateUserPreferences(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    logger.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Reset preferences to defaults
 * @route   POST /api/notifications/preferences/reset
 * @access  Private
 */
const resetPreferences = asyncHandler(async (req, res) => {
  try {
    const preferences = await notificationPreferencesService.resetToDefaults(req.user.id);

    res.json({
      success: true,
      message: 'Preferences reset to defaults',
      data: preferences
    });

  } catch (error) {
    logger.error('Error resetting preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Get preferences summary for school
 * @route   GET /api/notifications/preferences/summary
 * @access  Private (Admin)
 */
const getPreferencesSummary = asyncHandler(async (req, res) => {
  try {
    const summary = await notificationPreferencesService.getSchoolPreferencesSummary(req.school.id);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error getting preferences summary:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = {
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
};