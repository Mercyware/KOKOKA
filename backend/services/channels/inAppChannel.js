const logger = require('../../utils/logger');

class InAppChannel {
  constructor() {
    this.connectedUsers = new Map(); // userId -> socket connections
    this.socketIO = null;
  }

  /**
   * Initialize Socket.IO instance
   */
  initialize(io) {
    this.socketIO = io;
    this.setupSocketHandlers();
    logger.info('In-App notification channel initialized with Socket.IO');
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupSocketHandlers() {
    if (!this.socketIO) return;

    this.socketIO.on('connection', (socket) => {
      logger.debug(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token, userId, schoolId } = data;
          
          // Verify JWT token (implement your authentication logic here)
          const user = await this.verifyUserToken(token, userId, schoolId);
          
          if (user) {
            socket.userId = user.id;
            socket.schoolId = user.schoolId;
            socket.userRole = user.role;
            
            // Store connection
            if (!this.connectedUsers.has(user.id)) {
              this.connectedUsers.set(user.id, new Set());
            }
            this.connectedUsers.get(user.id).add(socket);
            
            // Join user-specific room
            socket.join(`user_${user.id}`);
            socket.join(`school_${user.schoolId}`);
            socket.join(`role_${user.role}`);
            
            socket.emit('authenticated', { 
              success: true, 
              userId: user.id,
              unreadCount: await this.getUnreadCount(user.id)
            });
            
            logger.info(`User ${user.id} authenticated on socket ${socket.id}`);
            
            // Send any pending notifications
            await this.sendPendingNotifications(user.id, socket);
            
          } else {
            socket.emit('authentication_error', { message: 'Invalid token' });
            socket.disconnect(true);
          }
          
        } catch (error) {
          logger.error('Socket authentication error:', error);
          socket.emit('authentication_error', { message: 'Authentication failed' });
          socket.disconnect(true);
        }
      });

      // Handle marking notifications as read
      socket.on('mark_read', async (data) => {
        try {
          const { notificationId } = data;
          
          if (socket.userId && notificationId) {
            await this.markNotificationAsRead(notificationId, socket.userId);
            socket.emit('marked_read', { notificationId, success: true });
            
            // Update unread count
            const unreadCount = await this.getUnreadCount(socket.userId);
            socket.emit('unread_count_updated', { count: unreadCount });
          }
          
        } catch (error) {
          logger.error('Error marking notification as read:', error);
          socket.emit('marked_read', { success: false, error: error.message });
        }
      });

      // Handle marking all notifications as read
      socket.on('mark_all_read', async () => {
        try {
          if (socket.userId) {
            await this.markAllAsRead(socket.userId);
            socket.emit('marked_all_read', { success: true });
            
            // Update unread count
            socket.emit('unread_count_updated', { count: 0 });
          }
        } catch (error) {
          logger.error('Error marking all notifications as read:', error);
          socket.emit('marked_all_read', { success: false, error: error.message });
        }
      });

      // Handle fetching notification history
      socket.on('get_notifications', async (data) => {
        try {
          const { page = 1, limit = 20, unreadOnly = false } = data;
          
          if (socket.userId) {
            const notifications = await this.getUserNotifications(socket.userId, {
              page, limit, unreadOnly
            });
            
            socket.emit('notifications_data', notifications);
          }
          
        } catch (error) {
          logger.error('Error fetching notifications:', error);
          socket.emit('notifications_error', { message: error.message });
        }
      });

      // Handle typing indicators for group notifications
      socket.on('typing', (data) => {
        if (socket.userId && data.roomId) {
          socket.to(data.roomId).emit('user_typing', {
            userId: socket.userId,
            typing: data.typing
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.debug(`Client disconnected: ${socket.id}`);
        
        if (socket.userId) {
          const userSockets = this.connectedUsers.get(socket.userId);
          if (userSockets) {
            userSockets.delete(socket);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(socket.userId);
            }
          }
          logger.info(`User ${socket.userId} disconnected from socket ${socket.id}`);
        }
      });

      // Handle heartbeat/ping
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  /**
   * Send in-app notification
   * @param {Object} user - Target user
   * @param {Object} content - Notification content
   * @param {Object} notification - Notification object
   */
  async send(user, content, notification) {
    try {
      const userId = user.id;
      const userSockets = this.connectedUsers.get(userId);
      
      if (!userSockets || userSockets.size === 0) {
        // User is not connected, notification will be stored for later
        logger.debug(`User ${userId} not connected, notification stored for later delivery`);
        return {
          provider: 'in-app',
          status: 'stored',
          timestamp: new Date().toISOString(),
          userId: userId
        };
      }

      const notificationData = {
        id: notification.id,
        title: content.title || notification.title,
        message: content.inAppContent || content.message || notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        timestamp: new Date().toISOString(),
        schoolId: notification.schoolId,
        metadata: notification.metadata,
        actions: this.generateNotificationActions(notification)
      };

      // Send to all user's connected sockets
      let sentCount = 0;
      for (const socket of userSockets) {
        try {
          socket.emit('new_notification', notificationData);
          sentCount++;
        } catch (error) {
          logger.error(`Error sending to socket ${socket.id}:`, error);
          userSockets.delete(socket);
        }
      }

      // Also send to user room (backup)
      if (this.socketIO) {
        this.socketIO.to(`user_${userId}`).emit('new_notification', notificationData);
      }

      // Update unread count for user
      const unreadCount = await this.getUnreadCount(userId);
      this.sendToUser(userId, 'unread_count_updated', { count: unreadCount });

      logger.info(`In-app notification sent to ${sentCount} connections for user ${userId}`);

      return {
        provider: 'in-app',
        status: 'sent',
        timestamp: new Date().toISOString(),
        userId: userId,
        connectionsCount: sentCount
      };

    } catch (error) {
      logger.error('Error sending in-app notification:', error);
      throw new Error(`In-app notification failed: ${error.message}`);
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, event, data) {
    if (this.socketIO) {
      this.socketIO.to(`user_${userId}`).emit(event, data);
    }

    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      for (const socket of userSockets) {
        try {
          socket.emit(event, data);
        } catch (error) {
          logger.error(`Error sending ${event} to socket:`, error);
          userSockets.delete(socket);
        }
      }
    }
  }

  /**
   * Send message to school
   */
  sendToSchool(schoolId, event, data) {
    if (this.socketIO) {
      this.socketIO.to(`school_${schoolId}`).emit(event, data);
    }
  }

  /**
   * Send message to role
   */
  sendToRole(schoolId, role, event, data) {
    if (this.socketIO) {
      this.socketIO.to(`role_${role}`).emit(event, data);
    }
  }

  /**
   * Broadcast to all connected users in school
   */
  broadcastToSchool(schoolId, event, data) {
    this.sendToSchool(schoolId, event, data);
  }

  /**
   * Generate notification actions based on type
   */
  generateNotificationActions(notification) {
    const actions = [];

    switch (notification.type) {
      case 'GRADE_UPDATE':
        actions.push({
          label: 'View Grade',
          action: 'navigate',
          target: `/grades/${notification.metadata?.gradeId}`
        });
        break;
        
      case 'ASSIGNMENT':
        actions.push({
          label: 'View Assignment',
          action: 'navigate',
          target: `/assignments/${notification.metadata?.assignmentId}`
        });
        break;
        
      case 'FEE_REMINDER':
        actions.push({
          label: 'Pay Now',
          action: 'navigate',
          target: '/payments'
        });
        break;
        
      case 'ATTENDANCE':
        actions.push({
          label: 'View Attendance',
          action: 'navigate',
          target: '/attendance'
        });
        break;

      case 'ANNOUNCEMENT':
        actions.push({
          label: 'View Details',
          action: 'navigate',
          target: `/announcements/${notification.metadata?.announcementId}`
        });
        break;
    }

    // Always add mark as read action
    actions.push({
      label: 'Mark as Read',
      action: 'mark_read',
      target: notification.id
    });

    return actions;
  }

  /**
   * Send pending notifications to newly connected user
   */
  async sendPendingNotifications(userId, socket) {
    try {
      const notifications = await this.getUserNotifications(userId, { 
        limit: 10, 
        unreadOnly: true 
      });

      if (notifications.notifications && notifications.notifications.length > 0) {
        socket.emit('pending_notifications', {
          notifications: notifications.notifications.map(un => ({
            id: un.notification.id,
            title: un.notification.title,
            message: un.notification.message,
            type: un.notification.type,
            priority: un.notification.priority,
            category: un.notification.category,
            timestamp: un.createdAt,
            isRead: un.isRead,
            actions: this.generateNotificationActions(un.notification)
          })),
          hasMore: notifications.pagination.pages > 1
        });
      }

    } catch (error) {
      logger.error('Error sending pending notifications:', error);
    }
  }

  /**
   * Verify user token and get user data
   */
  async verifyUserToken(token, userId, schoolId) {
    try {
      const jwt = require('jsonwebtoken');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.userId !== userId || decoded.schoolId !== schoolId) {
        throw new Error('Token user/school mismatch');
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId, schoolId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          role: true, 
          schoolId: true, 
          isActive: true 
        }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;

    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCount(userId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const count = await prisma.userNotification.count({
        where: { 
          userId, 
          isRead: false,
          notification: {
            status: 'SENT'
          }
        }
      });

      return count;

    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.userNotification.updateMany({
        where: { notificationId, userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });

      // Update notification read count
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readCount: { increment: 1 } }
      });

    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const updated = await prisma.userNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });

      return updated.count;

    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const { 
        page = 1, 
        limit = 20, 
        unreadOnly = false,
        type = null,
        category = null
      } = options;

      const skip = (page - 1) * limit;
      const where = { userId };
      
      if (unreadOnly) where.isRead = false;

      const notificationWhere = { status: 'SENT' };
      if (type) notificationWhere.type = type;
      if (category) notificationWhere.category = category;

      const [notifications, total] = await Promise.all([
        prisma.userNotification.findMany({
          where,
          include: {
            notification: {
              where: notificationWhere,
              include: {
                school: { select: { name: true, logo: true } },
                createdBy: { select: { name: true, role: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.userNotification.count({ where })
      ]);

      return {
        notifications: notifications.filter(un => un.notification),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connection status for user
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).size > 0;
  }

  /**
   * Send system announcement to all connected users
   */
  sendSystemAnnouncement(message, priority = 'NORMAL') {
    if (this.socketIO) {
      this.socketIO.emit('system_announcement', {
        message,
        priority,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send maintenance notification
   */
  sendMaintenanceNotification(message, scheduledTime = null) {
    if (this.socketIO) {
      this.socketIO.emit('maintenance_notification', {
        message,
        scheduledTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get channel status
   */
  getStatus() {
    return {
      enabled: !!this.socketIO,
      connectedUsers: this.connectedUsers.size,
      totalConnections: Array.from(this.connectedUsers.values())
        .reduce((sum, sockets) => sum + sockets.size, 0)
    };
  }

  /**
   * Cleanup inactive connections
   */
  cleanupConnections() {
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      for (const socket of sockets) {
        if (!socket.connected) {
          sockets.delete(socket);
        }
      }
      
      if (sockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }
}

module.exports = new InAppChannel();