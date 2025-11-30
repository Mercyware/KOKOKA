const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');
const NotificationRulesEngine = require('./NotificationRulesEngine');
const emailService = require('../emailService');

/**
 * NotificationService
 * Multi-channel notification delivery (in-app, email, SMS)
 */
class NotificationService {
  /**
   * Send a notification through appropriate channels
   */
  async sendNotification(notificationData) {
    try {
      const {
        userId,
        type,
        title,
        message,
        priority = 'MEDIUM',
        metadata = {},
        channels = ['IN_APP'], // Default to in-app only
      } = notificationData;

      // Calculate priority if not provided
      const calculatedPriority = priority || NotificationRulesEngine.calculatePriority({
        type,
        metadata,
      });

      // Check if notification should be sent
      const shouldSend = await NotificationRulesEngine.shouldSendNotification({
        userId,
        notificationType: type,
        priority: calculatedPriority,
        metadata,
      });

      if (!shouldSend) {
        logger.info(`Notification blocked by rules: ${type} for user: ${userId}`);
        return null;
      }

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          priority: calculatedPriority,
          metadata,
          isRead: false,
          channels,
        },
      });

      // Send through requested channels
      const deliveryResults = await this.deliverToChannels(notification, channels);

      logger.info(`Notification sent: ${notification.id} to user: ${userId}`);

      return {
        notification,
        deliveryResults,
      };
    } catch (error) {
      logger.error(`Error sending notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deliver notification to specified channels
   */
  async deliverToChannels(notification, channels) {
    const results = {
      inApp: false,
      email: false,
      sms: false,
      push: false,
    };

    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: {
          email: true,
          phone: true,
          notificationPreferences: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const prefs = user.notificationPreferences || {};

      // In-app (always delivered if requested)
      if (channels.includes('IN_APP')) {
        results.inApp = true;
      }

      // Email
      if (channels.includes('EMAIL') && prefs.email !== false && user.email) {
        results.email = await this.sendEmail(user.email, notification);
      }

      // SMS (placeholder - requires SMS provider integration)
      if (channels.includes('SMS') && prefs.sms === true && user.phone) {
        results.sms = await this.sendSMS(user.phone, notification);
      }

      // Push notifications (placeholder - requires push notification setup)
      if (channels.includes('PUSH') && prefs.push !== false) {
        results.push = await this.sendPushNotification(notification);
      }

      return results;
    } catch (error) {
      logger.error(`Error delivering to channels: ${error.message}`);
      return results;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(email, notification) {
    try {
      const emailData = {
        to: email,
        subject: notification.title,
        text: notification.message,
        html: this.generateEmailHTML(notification),
      };

      await emailService.sendEmail(emailData);
      logger.info(`Email notification sent to: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate email HTML template
   */
  generateEmailHTML(notification) {
    const priorityColors = {
      CRITICAL: '#dc2626',
      HIGH: '#ea580c',
      MEDIUM: '#0891b2',
      LOW: '#059669',
      INFO: '#6b7280',
    };

    const color = priorityColors[notification.priority] || priorityColors.MEDIUM;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 40px; border-bottom: 3px solid ${color};">
                    <h1 style="margin: 0; color: #111827; font-size: 24px;">KOKOKA</h1>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">School Management System</p>
                  </td>
                </tr>

                <!-- Priority Badge -->
                <tr>
                  <td style="padding: 20px 40px 0 40px;">
                    <span style="display: inline-block; padding: 4px 12px; background-color: ${color}; color: white; border-radius: 12px; font-size: 12px; font-weight: bold;">
                      ${notification.priority}
                    </span>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px;">${notification.title}</h2>
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">${notification.message}</p>
                  </td>
                </tr>

                <!-- Action Button (if applicable) -->
                ${notification.metadata?.actionUrl ? `
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <a href="${notification.metadata.actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${color}; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      View Details
                    </a>
                  </td>
                </tr>
                ` : ''}

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      This is an automated notification from KOKOKA School Management System.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                      To manage your notification preferences, log in to your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Send SMS notification (placeholder)
   */
  async sendSMS(phone, notification) {
    try {
      // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
      logger.info(`SMS notification would be sent to: ${phone}`);
      logger.info(`Message: ${notification.message}`);

      // For now, just log
      return false; // Return true when SMS provider is integrated
    } catch (error) {
      logger.error(`Error sending SMS notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Send push notification (placeholder)
   */
  async sendPushNotification(notification) {
    try {
      // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
      logger.info(`Push notification would be sent for: ${notification.id}`);

      // For now, just log
      return false; // Return true when push provider is integrated
    } catch (error) {
      logger.error(`Error sending push notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const {
        isRead,
        type,
        priority,
        limit = 50,
        offset = 0,
      } = filters;

      const where = { userId };

      if (isRead !== undefined) {
        where.isRead = isRead === 'true' || isRead === true;
      }

      if (type) {
        where.type = type;
      }

      if (priority) {
        where.priority = priority;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId,
            isRead: false,
          },
        }),
      ]);

      return {
        notifications,
        total,
        unreadCount,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`Error fetching user notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(`Marked ${result.count} notifications as read for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Error marking all as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      logger.info(`Notification deleted: ${notificationId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk send notifications
   */
  async bulkSendNotifications(notificationsData) {
    try {
      const results = await Promise.all(
        notificationsData.map(async (data) => {
          try {
            return await this.sendNotification(data);
          } catch (error) {
            logger.error(`Error in bulk send: ${error.message}`);
            return { error: error.message, data };
          }
        })
      );

      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);

      logger.info(`Bulk send completed: ${successful.length} successful, ${failed.length} failed`);

      return {
        successful,
        failed,
        total: notificationsData.length,
      };
    } catch (error) {
      logger.error(`Error in bulk send notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId,
      }));

      return await this.bulkSendNotifications(notifications);
    } catch (error) {
      logger.error(`Error sending to multiple users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest(userId) {
    try {
      const grouped = await NotificationRulesEngine.batchNotificationsForDigest(
        userId,
        'DAILY'
      );

      if (Object.keys(grouped).length === 0) {
        logger.info(`No notifications for daily digest: ${userId}`);
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user?.email) {
        throw new Error('User email not found');
      }

      const digestHTML = this.generateDigestHTML(grouped, user.name);

      await emailService.sendEmail({
        to: user.email,
        subject: 'Your Daily Notification Digest',
        html: digestHTML,
      });

      // Mark notifications as read
      const notificationIds = Object.values(grouped)
        .flat()
        .map(n => n.id);

      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(`Daily digest sent to: ${userId}`);
      return { success: true, count: notificationIds.length };
    } catch (error) {
      logger.error(`Error sending daily digest: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate digest email HTML
   */
  generateDigestHTML(groupedNotifications, userName) {
    const totalCount = Object.values(groupedNotifications)
      .reduce((sum, arr) => sum + arr.length, 0);

    let notificationSections = '';

    for (const [type, notifications] of Object.entries(groupedNotifications)) {
      notificationSections += `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; border-bottom: 2px solid #0891b2; padding-bottom: 8px;">
              ${this.formatNotificationType(type)} (${notifications.length})
            </h3>
            ${notifications.map(n => `
              <div style="padding: 12px; background-color: #f9fafb; border-left: 3px solid #0891b2; margin-bottom: 10px;">
                <p style="margin: 0 0 5px 0; color: #111827; font-weight: bold;">${n.title}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${n.message}</p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                  ${new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            `).join('')}
          </td>
        </tr>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Notification Digest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 40px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Daily Notification Digest</h1>
                    <p style="margin: 5px 0 0 0; color: #f0f9ff; font-size: 14px;">
                      Hello ${userName}, you have ${totalCount} notification${totalCount !== 1 ? 's' : ''} from the past 24 hours
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${notificationSections}
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      This is your daily digest from KOKOKA School Management System.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                      To change digest preferences, log in to your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Format notification type for display
   */
  formatNotificationType(type) {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId, days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [total, unread, byType, byPriority] = await Promise.all([
        prisma.notification.count({
          where: {
            userId,
            createdAt: { gte: since },
          },
        }),
        prisma.notification.count({
          where: {
            userId,
            isRead: false,
          },
        }),
        prisma.notification.groupBy({
          by: ['type'],
          where: {
            userId,
            createdAt: { gte: since },
          },
          _count: true,
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: {
            userId,
            createdAt: { gte: since },
          },
          _count: true,
        }),
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {}),
        timeframe: `Last ${days} days`,
      };
    } catch (error) {
      logger.error(`Error fetching notification stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new NotificationService();
