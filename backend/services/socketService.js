const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const inAppChannel = require('./channels/inAppChannel');
const logger = require('../utils/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.initialized = false;
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(server) {
    if (this.initialized) {
      logger.warn('Socket service already initialized');
      return this.io;
    }

    const corsOrigins = process.env.WEBSOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

    this.io = new Server(server, {
      cors: {
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: parseInt(process.env.WEBSOCKET_HEARTBEAT_INTERVAL) || 30000,
      pingInterval: 10000,
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
    
    // Initialize in-app channel with Socket.IO instance
    inAppChannel.initialize(this.io);

    this.initialized = true;
    logger.info('Socket.IO service initialized successfully');

    return this.io;
  }

  /**
   * Setup Socket.IO middleware
   */
  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
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
          return next(new Error('User not found or inactive'));
        }

        // Attach user info to socket
        socket.userId = user.id;
        socket.userEmail = user.email;
        socket.userName = user.name;
        socket.userRole = user.role;
        socket.schoolId = user.schoolId;

        next();

      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      // Implement rate limiting if needed
      socket.rateLimitCount = 0;
      socket.rateLimitReset = Date.now() + 60000; // Reset every minute
      
      next();
    });

    // Logging middleware
    this.io.use((socket, next) => {
      logger.debug(`Socket connection attempt from ${socket.handshake.address}`, {
        userId: socket.userId,
        userAgent: socket.handshake.headers['user-agent']
      });
      
      next();
    });
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User ${socket.userId} connected via Socket.IO`, {
        socketId: socket.id,
        userRole: socket.userRole,
        schoolId: socket.schoolId
      });

      // Join user-specific rooms
      socket.join(`user_${socket.userId}`);
      socket.join(`school_${socket.schoolId}`);
      socket.join(`role_${socket.userRole}`);
      
      // Join school-wide room
      socket.join(`school_${socket.schoolId}_all`);

      // Send connection confirmation
      socket.emit('connected', {
        userId: socket.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        rooms: Array.from(socket.rooms)
      });

      // Handle notification subscription
      socket.on('subscribe_notifications', (data) => {
        try {
          const { categories = [], types = [] } = data;
          
          // Join category-specific rooms
          categories.forEach(category => {
            socket.join(`category_${category}_${socket.schoolId}`);
          });
          
          // Join type-specific rooms
          types.forEach(type => {
            socket.join(`type_${type}_${socket.schoolId}`);
          });

          socket.emit('subscribed', {
            categories,
            types,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          logger.error('Error subscribing to notifications:', error);
          socket.emit('subscription_error', { message: error.message });
        }
      });

      // Handle notification unsubscription
      socket.on('unsubscribe_notifications', (data) => {
        try {
          const { categories = [], types = [] } = data;
          
          // Leave category-specific rooms
          categories.forEach(category => {
            socket.leave(`category_${category}_${socket.schoolId}`);
          });
          
          // Leave type-specific rooms  
          types.forEach(type => {
            socket.leave(`type_${type}_${socket.schoolId}`);
          });

          socket.emit('unsubscribed', {
            categories,
            types,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          logger.error('Error unsubscribing from notifications:', error);
          socket.emit('subscription_error', { message: error.message });
        }
      });

      // Handle user status updates
      socket.on('user_status', (status) => {
        try {
          // Broadcast status to school members (if needed)
          socket.to(`school_${socket.schoolId}`).emit('user_status_update', {
            userId: socket.userId,
            status,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          logger.error('Error handling user status:', error);
        }
      });

      // Handle custom events for different user roles
      this.setupRoleSpecificHandlers(socket);

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${socket.userId}:`, error);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`User ${socket.userId} disconnected`, {
          reason,
          socketId: socket.id,
          duration: Date.now() - socket.handshake.time
        });

        // Clean up any user-specific data if needed
        this.handleUserDisconnect(socket);
      });

      // Heartbeat/ping handler
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback({
            timestamp: new Date().toISOString(),
            server: 'KOKOKA-Socket-Server'
          });
        }
      });
    });
  }

  /**
   * Setup role-specific event handlers
   */
  setupRoleSpecificHandlers(socket) {
    switch (socket.userRole) {
      case 'TEACHER':
        this.setupTeacherHandlers(socket);
        break;
      case 'STUDENT':
        this.setupStudentHandlers(socket);
        break;
      case 'PARENT':
        this.setupParentHandlers(socket);
        break;
      case 'ADMIN':
      case 'PRINCIPAL':
        this.setupAdminHandlers(socket);
        break;
    }
  }

  /**
   * Setup teacher-specific handlers
   */
  setupTeacherHandlers(socket) {
    // Join teacher-specific rooms
    socket.join(`teachers_${socket.schoolId}`);

    socket.on('class_update', (data) => {
      // Broadcast to students in the class
      socket.to(`class_${data.classId}_${socket.schoolId}`).emit('class_notification', {
        type: 'class_update',
        teacherId: socket.userId,
        teacherName: socket.userName,
        data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('assignment_posted', (data) => {
      // Notify students and parents
      socket.to(`class_${data.classId}_${socket.schoolId}`).emit('assignment_notification', {
        type: 'assignment_posted',
        teacherId: socket.userId,
        teacherName: socket.userName,
        data,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup student-specific handlers
   */
  setupStudentHandlers(socket) {
    // Join student-specific rooms (class-based)
    // This would typically involve getting student's class info
    socket.on('join_class', (classId) => {
      socket.join(`class_${classId}_${socket.schoolId}`);
      socket.emit('joined_class', { classId, timestamp: new Date().toISOString() });
    });

    socket.on('assignment_submission', (data) => {
      // Notify teacher
      socket.to(`teachers_${socket.schoolId}`).emit('assignment_submitted', {
        studentId: socket.userId,
        studentName: socket.userName,
        data,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup parent-specific handlers
   */
  setupParentHandlers(socket) {
    socket.join(`parents_${socket.schoolId}`);

    socket.on('request_child_info', (childId) => {
      // Handle parent requesting child information
      socket.emit('child_info_requested', {
        childId,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup admin-specific handlers
   */
  setupAdminHandlers(socket) {
    socket.join(`admins_${socket.schoolId}`);

    socket.on('broadcast_announcement', (data) => {
      // Broadcast to entire school
      socket.to(`school_${socket.schoolId}_all`).emit('school_announcement', {
        type: 'announcement',
        adminId: socket.userId,
        adminName: socket.userName,
        data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('emergency_alert', (data) => {
      // Emergency broadcast to everyone
      this.io.to(`school_${socket.schoolId}_all`).emit('emergency_alert', {
        type: 'emergency',
        adminId: socket.userId,
        adminName: socket.userName,
        priority: 'CRITICAL',
        data,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Handle user disconnect cleanup
   */
  handleUserDisconnect(socket) {
    // Clean up any real-time subscriptions or temporary data
    // This is handled automatically by Socket.IO room cleanup
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId, event, data) {
    if (!this.io) return false;

    this.io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send notification to school
   */
  sendToSchool(schoolId, event, data) {
    if (!this.io) return false;

    this.io.to(`school_${schoolId}_all`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send notification to role
   */
  sendToRole(schoolId, role, event, data) {
    if (!this.io) return false;

    this.io.to(`role_${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send notification to specific room
   */
  sendToRoom(room, event, data) {
    if (!this.io) return false;

    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Get connected users count
   */
  async getConnectedUsersCount() {
    if (!this.io) return 0;

    const sockets = await this.io.fetchSockets();
    return sockets.length;
  }

  /**
   * Get connected users by school
   */
  async getConnectedUsersBySchool(schoolId) {
    if (!this.io) return [];

    const socketsInRoom = await this.io.in(`school_${schoolId}_all`).fetchSockets();
    
    return socketsInRoom.map(socket => ({
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      connectedAt: socket.handshake.time,
      socketId: socket.id
    }));
  }

  /**
   * Check if user is connected
   */
  async isUserConnected(userId) {
    if (!this.io) return false;

    const socketsInRoom = await this.io.in(`user_${userId}`).fetchSockets();
    return socketsInRoom.length > 0;
  }

  /**
   * Get server statistics
   */
  async getStats() {
    if (!this.io) {
      return {
        initialized: false,
        totalConnections: 0,
        rooms: 0
      };
    }

    const sockets = await this.io.fetchSockets();
    const rooms = this.io.sockets.adapter.rooms;

    return {
      initialized: this.initialized,
      totalConnections: sockets.length,
      rooms: rooms.size,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Send system maintenance notification
   */
  sendMaintenanceNotification(message, scheduledTime = null) {
    if (!this.io) return false;

    this.io.emit('system_maintenance', {
      message,
      scheduledTime,
      timestamp: new Date().toISOString(),
      priority: 'HIGH'
    });

    return true;
  }

  /**
   * Close Socket.IO server
   */
  close() {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.initialized = false;
      logger.info('Socket.IO service closed');
    }
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

module.exports = new SocketService();