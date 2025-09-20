const { PrismaClient } = require('@prisma/client');
const emailChannel = require('./channels/emailChannel');
const smsChannel = require('./channels/smsChannel');
const pushChannel = require('./channels/pushChannel');
const inAppChannel = require('./channels/inAppChannel');
const webhookChannel = require('./channels/webhookChannel');
const templateService = require('./templateService');
const logger = require('../utils/logger');
const Bull = require('bull');
const Redis = require('ioredis');

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    this.channels = {
      EMAIL: emailChannel,
      SMS: smsChannel,
      PUSH: pushChannel,
      IN_APP: inAppChannel,
      WEBHOOK: webhookChannel
    };

    // Initialize Redis for queue management
    this.redis = new Redis(process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    });

    // Initialize notification queue if enabled
    if (process.env.NOTIFICATIONS_QUEUE_ENABLED === 'true') {
      this.notificationQueue = new Bull('notification processing', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: parseInt(process.env.NOTIFICATIONS_MAX_RETRY_ATTEMPTS) || 3,
          backoff: {
            type: 'exponential',
            delay: parseInt(process.env.NOTIFICATIONS_RETRY_DELAY_MS) || 5000
          }
        }
      });

      this.setupQueueProcessors();
    }
  }

  /**
   * Send notification to multiple channels
   * @param {Object} notificationData 
   * @param {Object} options 
   */
  async sendNotification(notificationData, options = {}) {
    try {
      const {
        schoolId,
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
        metadata = {},
        createdById
      } = notificationData;

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          schoolId,
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
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          metadata,
          createdById,
          status: scheduledAt ? 'SCHEDULED' : 'PENDING'
        },
        include: {
          template: true,
          school: true,
          createdBy: true
        }
      });

      // If scheduled, add to queue for later processing
      if (scheduledAt) {
        if (this.notificationQueue) {
          const delay = new Date(scheduledAt).getTime() - Date.now();
          await this.notificationQueue.add('process-notification', 
            { notificationId: notification.id }, 
            { delay: Math.max(0, delay) }
          );
        }
        return { success: true, notificationId: notification.id, status: 'scheduled' };
      }

      // Process immediately
      const result = await this.processNotification(notification.id);
      return result;

    } catch (error) {
      logger.error('Error sending notification:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Process a notification (resolve targets and send to channels)
   */
  async processNotification(notificationId) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          template: true,
          school: true,
          createdBy: true
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.status !== 'PENDING' && notification.status !== 'SCHEDULED') {
        throw new Error('Notification is not in a processable state');
      }

      // Update status to SENDING
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENDING', sentAt: new Date() }
      });

      // Resolve target users
      const targetUsers = await this.resolveTargetUsers(notification);
      
      // Update total targets count
      await prisma.notification.update({
        where: { id: notificationId },
        data: { totalTargets: targetUsers.length }
      });

      if (targetUsers.length === 0) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', deliveredAt: new Date() }
        });
        return { success: true, message: 'No target users found', targetsCount: 0 };
      }

      // Prepare notification content
      const content = await this.prepareNotificationContent(notification, targetUsers[0]);

      let successCount = 0;
      let failureCount = 0;
      const deliveryResults = [];

      // Send to each channel
      for (const channelType of notification.channels) {
        if (this.channels[channelType] && this.isChannelEnabled(channelType)) {
          const channelResults = await this.sendToChannel(
            channelType, 
            notification, 
            content, 
            targetUsers
          );
          
          deliveryResults.push(...channelResults);
          successCount += channelResults.filter(r => r.success).length;
          failureCount += channelResults.filter(r => !r.success).length;
        }
      }

      // Create user notifications for in-app tracking
      await this.createUserNotifications(notification.id, targetUsers, deliveryResults);

      // Update notification status
      const finalStatus = failureCount === 0 ? 'SENT' : 
                         successCount === 0 ? 'FAILED' : 'PARTIALLY_SENT';

      await prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: finalStatus,
          deliveredAt: new Date(),
          readCount: 0
        }
      });

      return {
        success: successCount > 0,
        notificationId,
        targetsCount: targetUsers.length,
        successCount,
        failureCount,
        deliveryResults: deliveryResults.map(r => ({
          channel: r.channel,
          success: r.success,
          error: r.error
        }))
      };

    } catch (error) {
      logger.error('Error processing notification:', error);
      
      // Update notification status to FAILED
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' }
      });

      throw error;
    }
  }

  /**
   * Resolve target users based on targeting criteria
   */
  async resolveTargetUsers(notification) {
    const { schoolId, targetType, targetUsers, targetRoles, targetClasses } = notification;
    
    let users = [];

    try {
      switch (targetType) {
        case 'ALL_USERS':
          users = await prisma.user.findMany({
            where: { 
              schoolId,
              isActive: true
            },
            include: {
              notificationPreferences: true,
              student: true,
              staff: true
            }
          });
          break;

        case 'SPECIFIC_USERS':
          if (targetUsers && targetUsers.length > 0) {
            users = await prisma.user.findMany({
              where: {
                id: { in: targetUsers },
                schoolId,
                isActive: true
              },
              include: {
                notificationPreferences: true,
                student: true,
                staff: true
              }
            });
          }
          break;

        case 'ROLE_BASED':
          if (targetRoles && targetRoles.length > 0) {
            users = await prisma.user.findMany({
              where: {
                schoolId,
                role: { in: targetRoles },
                isActive: true
              },
              include: {
                notificationPreferences: true,
                student: true,
                staff: true
              }
            });
          }
          break;

        case 'CLASS_BASED':
          if (targetClasses && targetClasses.length > 0) {
            const students = await prisma.student.findMany({
              where: {
                schoolId,
                currentClassId: { in: targetClasses },
                status: 'ACTIVE'
              },
              include: {
                user: {
                  include: {
                    notificationPreferences: true
                  }
                }
              }
            });
            users = students.map(s => s.user).filter(u => u && u.isActive);
          }
          break;

        case 'COMBINED':
          // Combine multiple targeting methods
          const combinedUserIds = new Set();

          if (targetUsers && targetUsers.length > 0) {
            targetUsers.forEach(id => combinedUserIds.add(id));
          }

          if (targetRoles && targetRoles.length > 0) {
            const roleUsers = await prisma.user.findMany({
              where: { schoolId, role: { in: targetRoles }, isActive: true },
              select: { id: true }
            });
            roleUsers.forEach(u => combinedUserIds.add(u.id));
          }

          if (targetClasses && targetClasses.length > 0) {
            const classStudents = await prisma.student.findMany({
              where: {
                schoolId,
                currentClassId: { in: targetClasses },
                status: 'ACTIVE'
              },
              include: { user: { select: { id: true } } }
            });
            classStudents.forEach(s => {
              if (s.user) combinedUserIds.add(s.user.id);
            });
          }

          if (combinedUserIds.size > 0) {
            users = await prisma.user.findMany({
              where: {
                id: { in: Array.from(combinedUserIds) },
                isActive: true
              },
              include: {
                notificationPreferences: true,
                student: true,
                staff: true
              }
            });
          }
          break;

        default:
          throw new Error(`Invalid target type: ${targetType}`);
      }

      // Filter users based on notification preferences
      users = this.filterUsersByPreferences(users, notification);

      return users;

    } catch (error) {
      logger.error('Error resolving target users:', error);
      throw error;
    }
  }

  /**
   * Filter users based on their notification preferences
   */
  filterUsersByPreferences(users, notification) {
    return users.filter(user => {
      const prefs = user.notificationPreferences;
      
      // If no preferences set, allow all notifications
      if (!prefs) return true;
      
      // Check if notifications are globally enabled for user
      if (!prefs.isEnabled) return false;

      // Check channel preferences
      const hasEnabledChannel = notification.channels.some(channel => {
        switch (channel) {
          case 'EMAIL': return prefs.emailEnabled;
          case 'SMS': return prefs.smsEnabled;
          case 'PUSH': return prefs.pushEnabled;
          case 'IN_APP': return prefs.inAppEnabled;
          default: return true;
        }
      });

      if (!hasEnabledChannel) return false;

      // Check quiet hours
      if (prefs.quietHoursEnabled && this.isInQuietHours(prefs)) {
        // Allow critical notifications during quiet hours
        return notification.priority === 'CRITICAL' || notification.priority === 'URGENT';
      }

      return true;
    });
  }

  /**
   * Check if current time is within user's quiet hours
   */
  isInQuietHours(preferences) {
    if (!preferences.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
    
    // Check if today is in quiet hours days
    if (preferences.quietHoursDays && !preferences.quietHoursDays.includes(currentDay)) {
      return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Spans midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Prepare notification content using templates
   */
  async prepareNotificationContent(notification, sampleUser = null) {
    let content = {
      title: notification.title,
      message: notification.message
    };

    // If template is specified, use it
    if (notification.template) {
      content = await templateService.renderTemplate(
        notification.template,
        {
          ...notification.templateData,
          user: sampleUser,
          school: notification.school,
          notification
        }
      );
    }

    return content;
  }

  /**
   * Send notification to specific channel
   */
  async sendToChannel(channelType, notification, content, targetUsers) {
    const channel = this.channels[channelType];
    if (!channel) {
      return [];
    }

    try {
      const results = [];
      
      // Process users in batches
      const batchSize = parseInt(process.env.NOTIFICATIONS_BATCH_SIZE) || 100;
      
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);
        
        for (const user of batch) {
          try {
            const result = await channel.send(user, content, notification);
            
            results.push({
              channel: channelType,
              userId: user.id,
              success: true,
              data: result
            });

            // Log successful delivery
            await this.logDelivery(notification.id, channelType, user, 'DELIVERED', result);

          } catch (error) {
            logger.error(`Error sending ${channelType} to user ${user.id}:`, error);
            
            results.push({
              channel: channelType,
              userId: user.id,
              success: false,
              error: error.message
            });

            // Log failed delivery
            await this.logDelivery(notification.id, channelType, user, 'FAILED', null, error.message);
          }
        }
      }

      return results;

    } catch (error) {
      logger.error(`Error in ${channelType} channel:`, error);
      throw error;
    }
  }

  /**
   * Log delivery attempt
   */
  async logDelivery(notificationId, channel, user, status, response = null, errorMessage = null) {
    try {
      const recipient = this.getRecipientForChannel(channel, user);
      
      await prisma.notificationDeliveryLog.create({
        data: {
          notificationId,
          channel,
          recipient,
          status,
          providerId: response?.id || response?.messageId || null,
          providerResponse: response ? JSON.stringify(response) : null,
          errorMessage,
          sentAt: status === 'DELIVERED' ? new Date() : null,
          failedAt: status === 'FAILED' ? new Date() : null
        }
      });
    } catch (error) {
      logger.error('Error logging delivery:', error);
    }
  }

  /**
   * Get recipient identifier for specific channel
   */
  getRecipientForChannel(channel, user) {
    switch (channel) {
      case 'EMAIL': return user.email;
      case 'SMS': return user.phone || (user.student?.phone) || (user.teacher?.phone) || (user.staff?.phone);
      case 'PUSH':
      case 'IN_APP': return user.id;
      default: return user.email;
    }
  }

  /**
   * Create user notifications for tracking
   */
  async createUserNotifications(notificationId, users, deliveryResults) {
    const userNotifications = users.map(user => {
      const userDeliveryResults = deliveryResults.filter(r => r.userId === user.id);
      const hasSuccessfulDelivery = userDeliveryResults.some(r => r.success);
      
      return {
        userId: user.id,
        notificationId,
        isDelivered: hasSuccessfulDelivery,
        deliveredAt: hasSuccessfulDelivery ? new Date() : null,
        channelData: JSON.stringify(userDeliveryResults)
      };
    });

    await prisma.userNotification.createMany({
      data: userNotifications
    });
  }

  /**
   * Check if channel is enabled
   */
  isChannelEnabled(channelType) {
    const enabledChecks = {
      EMAIL: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      SMS: process.env.SMS_NOTIFICATIONS_ENABLED === 'true',
      PUSH: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
      IN_APP: process.env.WEBSOCKET_NOTIFICATIONS_ENABLED === 'true',
      WEBHOOK: process.env.WEBHOOK_NOTIFICATIONS_ENABLED === 'true'
    };

    return enabledChecks[channelType] ?? false;
  }

  /**
   * Setup queue processors
   */
  setupQueueProcessors() {
    this.notificationQueue.process('process-notification', async (job) => {
      const { notificationId } = job.data;
      return await this.processNotification(notificationId);
    });

    this.notificationQueue.on('completed', (job, result) => {
      logger.info(`Notification job ${job.id} completed:`, result);
    });

    this.notificationQueue.on('failed', (job, err) => {
      logger.error(`Notification job ${job.id} failed:`, err);
    });
  }

  /**
   * Get notification by ID
   */
  async getNotification(id, schoolId = null) {
    const where = { id };
    if (schoolId) where.schoolId = schoolId;

    return await prisma.notification.findUnique({
      where,
      include: {
        template: true,
        school: true,
        createdBy: true,
        deliveryLogs: true,
        userNotifications: {
          include: { user: true }
        }
      }
    });
  }

  /**
   * Mark notification as read for a user
   */
  async markAsRead(notificationId, userId) {
    const userNotification = await prisma.userNotification.updateMany({
      where: { notificationId, userId },
      data: { isRead: true, readAt: new Date() }
    });

    // Update read count
    if (userNotification.count > 0) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readCount: { increment: 1 } }
      });
    }

    return userNotification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    const { 
      page = 1, 
      limit = 50, 
      unreadOnly = false, 
      type = null,
      category = null 
    } = options;

    const skip = (page - 1) * limit;
    const where = { userId };
    
    if (unreadOnly) where.isRead = false;

    const notificationWhere = {};
    if (type) notificationWhere.type = type;
    if (category) notificationWhere.category = category;

    const userNotifications = await prisma.userNotification.findMany({
      where,
      include: {
        notification: {
          where: notificationWhere,
          include: {
            school: true,
            createdBy: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.userNotification.count({ where });

    return {
      notifications: userNotifications.filter(un => un.notification),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(id, schoolId = null) {
    const where = { id, status: 'SCHEDULED' };
    if (schoolId) where.schoolId = schoolId;

    return await prisma.notification.update({
      where,
      data: { status: 'CANCELLED' }
    });
  }
}

module.exports = new NotificationService();