const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * NotificationRulesEngine
 * Intelligent notification triggering and prioritization
 */
class NotificationRulesEngine {
  constructor() {
    // Notification priorities
    this.priorities = {
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      INFO: 1,
    };

    // Notification frequency limits (per user per day)
    this.frequencyLimits = {
      CRITICAL: 999, // No limit for critical
      HIGH: 10,
      MEDIUM: 5,
      LOW: 3,
      INFO: 2,
    };
  }

  /**
   * Evaluate if a notification should be sent
   */
  async shouldSendNotification(ruleData) {
    try {
      const { userId, notificationType, priority, metadata } = ruleData;

      // Check user preferences
      const userPrefs = await this.getUserPreferences(userId);
      if (!this.checkUserPreferences(userPrefs, notificationType)) {
        logger.info(`Notification blocked by user preferences: ${userId}`);
        return false;
      }

      // Check frequency limits
      if (!await this.checkFrequencyLimit(userId, priority)) {
        logger.info(`Notification blocked by frequency limit: ${userId}`);
        return false;
      }

      // Check if similar notification was sent recently (deduplication)
      if (await this.isDuplicateNotification(userId, notificationType, metadata)) {
        logger.info(`Duplicate notification blocked: ${userId}`);
        return false;
      }

      // Check quiet hours
      if (this.isQuietHours(userPrefs)) {
        logger.info(`Notification blocked by quiet hours: ${userId}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error evaluating notification rule: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculate notification priority based on context
   */
  calculatePriority(notificationData) {
    const { type, metadata = {} } = notificationData;

    // Critical priorities
    if (type === 'RISK_ALERT' && metadata.riskLevel === 'CRITICAL') {
      return 'CRITICAL';
    }
    if (type === 'SAFETY_ALERT') {
      return 'CRITICAL';
    }
    if (type === 'EMERGENCY') {
      return 'CRITICAL';
    }

    // High priorities
    if (type === 'ASSIGNMENT_DUE' && metadata.hoursRemaining <= 24) {
      return 'HIGH';
    }
    if (type === 'GRADE_PUBLISHED' && metadata.grade < 60) {
      return 'HIGH';
    }
    if (type === 'ATTENDANCE_WARNING' && metadata.attendanceRate < 75) {
      return 'HIGH';
    }
    if (type === 'PAYMENT_DUE' && metadata.daysOverdue > 7) {
      return 'HIGH';
    }

    // Medium priorities
    if (type === 'ASSIGNMENT_DUE' && metadata.hoursRemaining <= 72) {
      return 'MEDIUM';
    }
    if (type === 'GRADE_PUBLISHED') {
      return 'MEDIUM';
    }
    if (type === 'EVENT_REMINDER' && metadata.daysUntil <= 1) {
      return 'MEDIUM';
    }
    if (type === 'PARENT_MESSAGE') {
      return 'MEDIUM';
    }

    // Low priorities
    if (type === 'ASSIGNMENT_CREATED') {
      return 'LOW';
    }
    if (type === 'EVENT_REMINDER' && metadata.daysUntil <= 7) {
      return 'LOW';
    }
    if (type === 'RESOURCE_RECOMMENDATION') {
      return 'LOW';
    }

    // Info/default
    return 'INFO';
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          notificationPreferences: true,
        },
      });

      // Default preferences if none exist
      return user?.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        quietHoursStart: 22, // 10 PM
        quietHoursEnd: 7, // 7 AM
        enabledTypes: [
          'ASSIGNMENT_DUE',
          'GRADE_PUBLISHED',
          'ATTENDANCE_WARNING',
          'RISK_ALERT',
          'EVENT_REMINDER',
          'PARENT_MESSAGE',
        ],
        digest: {
          enabled: true,
          frequency: 'DAILY', // DAILY, WEEKLY
          time: '08:00',
        },
      };
    } catch (error) {
      logger.error(`Error fetching user preferences: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if notification type is enabled for user
   */
  checkUserPreferences(preferences, notificationType) {
    if (!preferences) return true; // Default to allowing

    // Critical notifications always go through
    if (['RISK_ALERT', 'SAFETY_ALERT', 'EMERGENCY'].includes(notificationType)) {
      return true;
    }

    return preferences.enabledTypes?.includes(notificationType) !== false;
  }

  /**
   * Check frequency limit for user
   */
  async checkFrequencyLimit(userId, priority) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: today },
          priority,
        },
      });

      const limit = this.frequencyLimits[priority] || 5;
      return count < limit;
    } catch (error) {
      logger.error(`Error checking frequency limit: ${error.message}`);
      return true; // Allow on error
    }
  }

  /**
   * Check for duplicate notifications
   */
  async isDuplicateNotification(userId, notificationType, metadata) {
    try {
      // Check for similar notification in last 6 hours
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      const similar = await prisma.notification.findFirst({
        where: {
          userId,
          type: notificationType,
          createdAt: { gte: sixHoursAgo },
        },
      });

      if (!similar) return false;

      // For assignment notifications, check if it's the same assignment
      if (notificationType.startsWith('ASSIGNMENT_') && metadata.assignmentId) {
        return similar.metadata?.assignmentId === metadata.assignmentId;
      }

      // For grade notifications, check if it's the same submission
      if (notificationType === 'GRADE_PUBLISHED' && metadata.submissionId) {
        return similar.metadata?.submissionId === metadata.submissionId;
      }

      return true; // Consider duplicate if same type within timeframe
    } catch (error) {
      logger.error(`Error checking duplicate notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  isQuietHours(preferences) {
    if (!preferences?.quietHoursStart || !preferences?.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentHour >= start || currentHour < end;
    }

    return currentHour >= start && currentHour < end;
  }

  /**
   * Create notification rule
   */
  async createRule(ruleData) {
    try {
      const rule = await prisma.notificationRule.create({
        data: {
          ...ruleData,
          isActive: true,
        },
      });

      logger.info(`Notification rule created: ${rule.id}`);
      return rule;
    } catch (error) {
      logger.error(`Error creating notification rule: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active rules for school
   */
  async getActiveRules(schoolId) {
    try {
      const rules = await prisma.notificationRule.findMany({
        where: {
          schoolId,
          isActive: true,
        },
        orderBy: { priority: 'desc' },
      });

      return rules;
    } catch (error) {
      logger.error(`Error fetching active rules: ${error.message}`);
      throw error;
    }
  }

  /**
   * Evaluate rules against an event
   */
  async evaluateRulesForEvent(eventData) {
    try {
      const { eventType, schoolId, userId, metadata } = eventData;

      // Get active rules for this event type
      const rules = await prisma.notificationRule.findMany({
        where: {
          schoolId,
          eventType,
          isActive: true,
        },
      });

      const notifications = [];

      for (const rule of rules) {
        // Check if rule conditions match
        if (this.evaluateRuleConditions(rule, metadata)) {
          notifications.push({
            userId,
            type: rule.notificationType,
            priority: this.calculatePriority({
              type: rule.notificationType,
              metadata,
            }),
            title: this.generateNotificationTitle(rule, metadata),
            message: this.generateNotificationMessage(rule, metadata),
            metadata,
          });
        }
      }

      return notifications;
    } catch (error) {
      logger.error(`Error evaluating rules for event: ${error.message}`);
      return [];
    }
  }

  /**
   * Evaluate rule conditions
   */
  evaluateRuleConditions(rule, eventMetadata) {
    if (!rule.conditions) return true;

    try {
      // Simple condition evaluation
      const conditions = rule.conditions;

      for (const [key, value] of Object.entries(conditions)) {
        if (typeof value === 'object' && value !== null) {
          // Handle operators: gt, lt, gte, lte, eq, ne
          for (const [operator, threshold] of Object.entries(value)) {
            const actualValue = eventMetadata[key];

            switch (operator) {
              case 'gt':
                if (!(actualValue > threshold)) return false;
                break;
              case 'lt':
                if (!(actualValue < threshold)) return false;
                break;
              case 'gte':
                if (!(actualValue >= threshold)) return false;
                break;
              case 'lte':
                if (!(actualValue <= threshold)) return false;
                break;
              case 'eq':
                if (actualValue !== threshold) return false;
                break;
              case 'ne':
                if (actualValue === threshold) return false;
                break;
            }
          }
        } else {
          // Direct equality check
          if (eventMetadata[key] !== value) return false;
        }
      }

      return true;
    } catch (error) {
      logger.error(`Error evaluating rule conditions: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate notification title from rule template
   */
  generateNotificationTitle(rule, metadata) {
    let title = rule.titleTemplate || rule.notificationType;

    // Replace placeholders
    Object.keys(metadata).forEach(key => {
      title = title.replace(`{{${key}}}`, metadata[key]);
    });

    return title;
  }

  /**
   * Generate notification message from rule template
   */
  generateNotificationMessage(rule, metadata) {
    let message = rule.messageTemplate || 'You have a new notification';

    // Replace placeholders
    Object.keys(metadata).forEach(key => {
      message = message.replace(`{{${key}}}`, metadata[key]);
    });

    return message;
  }

  /**
   * Batch notifications for digest
   */
  async batchNotificationsForDigest(userId, timeframe = 'DAILY') {
    try {
      const since = timeframe === 'DAILY'
        ? new Date(Date.now() - 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          createdAt: { gte: since },
          isRead: false,
          priority: { in: ['LOW', 'INFO'] }, // Only batch low priority
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group by type
      const grouped = notifications.reduce((acc, notif) => {
        if (!acc[notif.type]) {
          acc[notif.type] = [];
        }
        acc[notif.type].push(notif);
        return acc;
      }, {});

      return grouped;
    } catch (error) {
      logger.error(`Error batching notifications: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new NotificationRulesEngine();
