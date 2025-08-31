const admin = require('firebase-admin');
const logger = require('../../utils/logger');

class PushChannel {
  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize push notification providers
   */
  initializeProviders() {
    // Initialize Firebase Admin SDK
    if (this.isFirebaseConfigured()) {
      try {
        // Check if Firebase app is already initialized
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
          });
        }
        
        this.firebaseMessaging = admin.messaging();
        this.firebaseEnabled = true;
        logger.info('Firebase push notifications initialized');
        
      } catch (error) {
        logger.error('Firebase initialization failed:', error);
        this.firebaseEnabled = false;
      }
    } else {
      this.firebaseEnabled = false;
      logger.warn('Firebase credentials not configured');
    }

    // Initialize OneSignal (alternative provider)
    if (process.env.ONESIGNAL_ENABLED === 'true' && 
        process.env.ONESIGNAL_APP_ID && 
        process.env.ONESIGNAL_REST_API_KEY) {
      
      this.oneSignalConfig = {
        appId: process.env.ONESIGNAL_APP_ID,
        restApiKey: process.env.ONESIGNAL_REST_API_KEY
      };
      this.oneSignalEnabled = true;
      logger.info('OneSignal push notifications initialized');
    } else {
      this.oneSignalEnabled = false;
    }

    if (!this.firebaseEnabled && !this.oneSignalEnabled) {
      logger.warn('No push notification providers configured');
    }
  }

  /**
   * Check if Firebase is properly configured
   */
  isFirebaseConfigured() {
    return !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
  }

  /**
   * Send push notification
   * @param {Object} user - Target user
   * @param {Object} content - Notification content
   * @param {Object} notification - Notification object
   */
  async send(user, content, notification) {
    const deviceTokens = await this.getUserDeviceTokens(user.id);
    
    if (!deviceTokens || deviceTokens.length === 0) {
      throw new Error('No device tokens found for user');
    }

    const pushData = {
      title: content.pushTitle || content.title || notification.title,
      body: content.pushContent || content.message || notification.message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        category: notification.category,
        schoolId: notification.schoolId,
        timestamp: new Date().toISOString(),
        ...notification.metadata
      }
    };

    // Try providers in order of preference
    const providers = this.getEnabledProviders();
    let lastError;

    for (const provider of providers) {
      try {
        const result = await this.sendWithProvider(provider, deviceTokens, pushData, notification);
        logger.info(`Push notification sent via ${provider} to user ${user.id}`, {
          messageId: result.messageId,
          notificationId: notification.id
        });
        return result;
      } catch (error) {
        logger.warn(`Push notification failed with ${provider}: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All push providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get enabled push providers in order of preference
   */
  getEnabledProviders() {
    const providers = [];
    
    if (this.firebaseEnabled) providers.push('firebase');
    if (this.oneSignalEnabled) providers.push('onesignal');
    
    return providers;
  }

  /**
   * Send push notification with specific provider
   */
  async sendWithProvider(provider, deviceTokens, pushData, notification) {
    switch (provider) {
      case 'firebase':
        return await this.sendWithFirebase(deviceTokens, pushData, notification);
      case 'onesignal':
        return await this.sendWithOneSignal(deviceTokens, pushData, notification);
      default:
        throw new Error(`Unknown push provider: ${provider}`);
    }
  }

  /**
   * Send push notification using Firebase
   */
  async sendWithFirebase(deviceTokens, pushData, notification) {
    try {
      const message = {
        notification: {
          title: pushData.title,
          body: pushData.body
        },
        data: Object.keys(pushData.data).reduce((acc, key) => {
          acc[key] = String(pushData.data[key]);
          return acc;
        }, {}),
        android: {
          priority: this.mapPriorityToFirebase(notification.priority),
          notification: {
            icon: 'ic_notification',
            color: '#2563eb',
            channelId: `notifications_${notification.category.toLowerCase()}`,
            priority: this.mapPriorityToFirebase(notification.priority),
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: pushData.title,
                body: pushData.body
              },
              badge: await this.getUserUnreadCount(notification.schoolId, deviceTokens[0]),
              sound: 'default'
            }
          }
        },
        webpush: {
          notification: {
            title: pushData.title,
            body: pushData.body,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            requireInteraction: notification.priority === 'URGENT' || notification.priority === 'CRITICAL'
          }
        }
      };

      let results;
      
      if (deviceTokens.length === 1) {
        message.token = deviceTokens[0];
        results = await this.firebaseMessaging.send(message);
        
        return {
          provider: 'firebase',
          messageId: results,
          status: 'sent',
          timestamp: new Date().toISOString(),
          sentCount: 1,
          failedCount: 0
        };
        
      } else {
        message.tokens = deviceTokens;
        results = await this.firebaseMessaging.sendMulticast(message);
        
        // Handle failed tokens
        if (results.failureCount > 0) {
          await this.handleFailedTokens(deviceTokens, results.responses);
        }
        
        return {
          provider: 'firebase',
          messageId: results.responses[0]?.messageId,
          status: results.failureCount === 0 ? 'sent' : 'partial',
          timestamp: new Date().toISOString(),
          sentCount: results.successCount,
          failedCount: results.failureCount,
          responses: results.responses
        };
      }

    } catch (error) {
      logger.error('Firebase push notification error:', error);
      throw new Error(`Firebase push failed: ${error.message}`);
    }
  }

  /**
   * Send push notification using OneSignal
   */
  async sendWithOneSignal(deviceTokens, pushData, notification) {
    try {
      const axios = require('axios');
      
      const payload = {
        app_id: this.oneSignalConfig.appId,
        include_external_user_ids: deviceTokens,
        headings: { en: pushData.title },
        contents: { en: pushData.body },
        data: pushData.data,
        priority: this.mapPriorityToOneSignal(notification.priority),
        android_channel_id: `notifications_${notification.category.toLowerCase()}`,
        small_icon: 'ic_notification',
        large_icon: '/icons/large-icon.png'
      };

      const response = await axios.post('https://onesignal.com/api/v1/notifications', payload, {
        headers: {
          'Authorization': `Basic ${this.oneSignalConfig.restApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        provider: 'onesignal',
        messageId: response.data.id,
        status: 'sent',
        timestamp: new Date().toISOString(),
        recipients: response.data.recipients
      };

    } catch (error) {
      logger.error('OneSignal push notification error:', error);
      throw new Error(`OneSignal push failed: ${error.message}`);
    }
  }

  /**
   * Map notification priority to Firebase priority
   */
  mapPriorityToFirebase(priority) {
    const priorityMap = {
      'LOW': 'normal',
      'NORMAL': 'normal',
      'HIGH': 'high',
      'URGENT': 'high',
      'CRITICAL': 'high'
    };

    return priorityMap[priority] || 'normal';
  }

  /**
   * Map notification priority to OneSignal priority
   */
  mapPriorityToOneSignal(priority) {
    const priorityMap = {
      'LOW': 3,
      'NORMAL': 5,
      'HIGH': 7,
      'URGENT': 9,
      'CRITICAL': 10
    };

    return priorityMap[priority] || 5;
  }

  /**
   * Get device tokens for a user
   */
  async getUserDeviceTokens(userId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // This assumes you have a DeviceToken model in your schema
      // You might need to create this model
      const tokens = await prisma.deviceToken.findMany({
        where: { 
          userId,
          isActive: true
        },
        select: { token: true, platform: true }
      });

      return tokens.map(t => t.token);

    } catch (error) {
      logger.error('Error fetching device tokens:', error);
      return [];
    }
  }

  /**
   * Get user's unread notification count for badge
   */
  async getUserUnreadCount(schoolId, deviceToken) {
    try {
      // This would typically involve looking up the user by device token
      // and getting their unread count
      return 0;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Handle failed Firebase tokens
   */
  async handleFailedTokens(tokens, responses) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const failedTokens = [];
      
      responses.forEach((response, index) => {
        if (!response.success) {
          const error = response.error;
          
          // If token is invalid or unregistered, mark for deletion
          if (error?.code === 'messaging/invalid-registration-token' ||
              error?.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[index]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await prisma.deviceToken.updateMany({
          where: { token: { in: failedTokens } },
          data: { isActive: false }
        });
        
        logger.info(`Disabled ${failedTokens.length} invalid device tokens`);
      }

    } catch (error) {
      logger.error('Error handling failed tokens:', error);
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(deviceTokens, topic) {
    if (!this.firebaseEnabled) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await this.firebaseMessaging.subscribeToTopic(deviceTokens, topic);
      logger.info(`Subscribed ${result.successCount} devices to topic ${topic}`);
      return result;
    } catch (error) {
      logger.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(deviceTokens, topic) {
    if (!this.firebaseEnabled) {
      throw new Error('Firebase not configured');
    }

    try {
      const result = await this.firebaseMessaging.unsubscribeFromTopic(deviceTokens, topic);
      logger.info(`Unsubscribed ${result.successCount} devices from topic ${topic}`);
      return result;
    } catch (error) {
      logger.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Send push notification to topic
   */
  async sendToTopic(topic, pushData, notification) {
    if (!this.firebaseEnabled) {
      throw new Error('Firebase not configured');
    }

    try {
      const message = {
        topic: topic,
        notification: {
          title: pushData.title,
          body: pushData.body
        },
        data: Object.keys(pushData.data).reduce((acc, key) => {
          acc[key] = String(pushData.data[key]);
          return acc;
        }, {})
      };

      const result = await this.firebaseMessaging.send(message);
      
      return {
        provider: 'firebase',
        messageId: result,
        status: 'sent',
        timestamp: new Date().toISOString(),
        topic: topic
      };

    } catch (error) {
      logger.error('Error sending to topic:', error);
      throw error;
    }
  }

  /**
   * Register device token
   */
  async registerDeviceToken(userId, token, platform, deviceInfo = {}) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Deactivate existing tokens for this user/device combination
      await prisma.deviceToken.updateMany({
        where: { userId, token },
        data: { isActive: false }
      });

      // Create new token record
      const deviceToken = await prisma.deviceToken.create({
        data: {
          userId,
          token,
          platform: platform.toUpperCase(),
          deviceInfo: JSON.stringify(deviceInfo),
          isActive: true
        }
      });

      logger.info(`Registered device token for user ${userId} on ${platform}`);
      return deviceToken;

    } catch (error) {
      logger.error('Error registering device token:', error);
      throw error;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const result = await prisma.deviceToken.updateMany({
        where: { token },
        data: { isActive: false }
      });

      logger.info(`Unregistered device token: ${token}`);
      return result;

    } catch (error) {
      logger.error('Error unregistering device token:', error);
      throw error;
    }
  }

  /**
   * Get push notification status
   */
  getStatus() {
    return {
      firebase: {
        enabled: this.firebaseEnabled,
        configured: this.isFirebaseConfigured()
      },
      onesignal: {
        enabled: this.oneSignalEnabled,
        configured: !!(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY)
      }
    };
  }

  /**
   * Send test push notification
   */
  async sendTest(userId, testType = 'basic') {
    const deviceTokens = await this.getUserDeviceTokens(userId);
    
    if (!deviceTokens || deviceTokens.length === 0) {
      throw new Error('No device tokens found for user');
    }

    const testPushData = {
      title: 'Test Push Notification',
      body: `Test push from KOKOKA - ${testType} (${new Date().toLocaleString()})`,
      data: {
        notificationId: 'test-push-' + Date.now(),
        type: 'SYSTEM',
        category: 'SYSTEM',
        schoolId: 'test',
        timestamp: new Date().toISOString()
      }
    };

    const testNotification = {
      id: 'test-push-' + Date.now(),
      schoolId: 'test',
      type: 'SYSTEM',
      priority: 'NORMAL'
    };

    return await this.sendWithProvider('firebase', deviceTokens, testPushData, testNotification);
  }

  /**
   * Validate device token
   */
  async validateDeviceToken(token) {
    if (!this.firebaseEnabled) {
      return false;
    }

    try {
      // Try to send a dry run message
      const message = {
        token: token,
        notification: {
          title: 'Test',
          body: 'Test'
        },
        dryRun: true
      };

      await this.firebaseMessaging.send(message);
      return true;
      
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PushChannel();