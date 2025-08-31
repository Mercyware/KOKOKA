const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class WebhookChannel {
  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET;
    this.timeout = parseInt(process.env.WEBHOOK_TIMEOUT) || 5000;
    this.maxRetries = parseInt(process.env.WEBHOOK_MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.WEBHOOK_RETRY_DELAY) || 1000;
  }

  /**
   * Send webhook notification
   * @param {Object} user - Target user
   * @param {Object} content - Notification content
   * @param {Object} notification - Notification object
   */
  async send(user, content, notification) {
    // Get webhook URLs for the user/school
    const webhookUrls = await this.getWebhookUrls(user.id, notification.schoolId);
    
    if (!webhookUrls || webhookUrls.length === 0) {
      throw new Error('No webhook URLs configured');
    }

    const webhookData = this.buildWebhookPayload(user, content, notification);
    const results = [];

    for (const webhookConfig of webhookUrls) {
      try {
        const result = await this.sendWebhook(webhookConfig, webhookData);
        results.push({
          url: webhookConfig.url,
          success: true,
          result: result
        });
      } catch (error) {
        logger.error(`Webhook failed for URL ${webhookConfig.url}:`, error);
        results.push({
          url: webhookConfig.url,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 0) {
      throw new Error('All webhook deliveries failed');
    }

    return {
      provider: 'webhook',
      status: successCount === results.length ? 'sent' : 'partial',
      timestamp: new Date().toISOString(),
      results: results,
      successCount: successCount,
      failureCount: results.length - successCount
    };
  }

  /**
   * Build webhook payload
   */
  buildWebhookPayload(user, content, notification) {
    return {
      event: 'notification.sent',
      timestamp: new Date().toISOString(),
      notification: {
        id: notification.id,
        title: content.title || notification.title,
        message: content.message || notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        metadata: notification.metadata
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      school: {
        id: notification.schoolId,
        name: notification.school?.name
      },
      channels: notification.channels,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt
    };
  }

  /**
   * Send webhook with retries
   */
  async sendWebhook(webhookConfig, payload, attempt = 1) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'KOKOKA-Webhook/1.0'
      };

      // Add signature if secret is configured
      if (this.webhookSecret) {
        const signature = this.generateSignature(JSON.stringify(payload));
        headers['X-Signature'] = signature;
        headers['X-Signature-256'] = `sha256=${signature}`;
      }

      // Add custom headers if specified
      if (webhookConfig.headers) {
        Object.assign(headers, webhookConfig.headers);
      }

      const response = await axios({
        method: webhookConfig.method || 'POST',
        url: webhookConfig.url,
        data: payload,
        headers: headers,
        timeout: this.timeout,
        validateStatus: (status) => status >= 200 && status < 300
      });

      logger.info(`Webhook delivered successfully to ${webhookConfig.url}`, {
        statusCode: response.status,
        attempt: attempt
      });

      return {
        statusCode: response.status,
        responseData: response.data,
        headers: response.headers,
        attempt: attempt
      };

    } catch (error) {
      logger.warn(`Webhook attempt ${attempt} failed for ${webhookConfig.url}:`, error.message);

      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        
        return await this.sendWebhook(webhookConfig, payload, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    if (!error.response) {
      // Network errors are retryable
      return true;
    }

    const status = error.response.status;
    
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  generateSignature(payload) {
    if (!this.webhookSecret) {
      return null;
    }

    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature) {
    if (!this.webhookSecret || !signature) {
      return false;
    }

    const expectedSignature = this.generateSignature(payload);
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get webhook URLs for user/school
   */
  async getWebhookUrls(userId, schoolId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // This assumes you have a WebhookSubscription model
      // You might need to create this model
      const subscriptions = await prisma.webhookSubscription.findMany({
        where: {
          OR: [
            { userId: userId, isActive: true },
            { schoolId: schoolId, isActive: true, userId: null }
          ]
        },
        select: {
          url: true,
          method: true,
          headers: true,
          events: true,
          isActive: true
        }
      });

      // Filter subscriptions that listen for notification events
      return subscriptions.filter(sub => 
        sub.events.includes('notification.sent') || 
        sub.events.includes('*')
      );

    } catch (error) {
      logger.error('Error fetching webhook URLs:', error);
      return [];
    }
  }

  /**
   * Register webhook subscription
   */
  async registerWebhook(data) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const {
        userId = null,
        schoolId,
        url,
        method = 'POST',
        headers = {},
        events = ['notification.sent'],
        description = '',
        isActive = true
      } = data;

      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid webhook URL');
      }

      // Test webhook endpoint
      const testResult = await this.testWebhookEndpoint(url, method, headers);
      if (!testResult.success) {
        throw new Error(`Webhook endpoint test failed: ${testResult.error}`);
      }

      const subscription = await prisma.webhookSubscription.create({
        data: {
          userId,
          schoolId,
          url,
          method,
          headers: JSON.stringify(headers),
          events,
          description,
          isActive
        }
      });

      logger.info(`Webhook registered: ${url} for school ${schoolId}`);
      return subscription;

    } catch (error) {
      logger.error('Error registering webhook:', error);
      throw error;
    }
  }

  /**
   * Update webhook subscription
   */
  async updateWebhook(id, updateData) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      if (updateData.url && !this.isValidUrl(updateData.url)) {
        throw new Error('Invalid webhook URL');
      }

      if (updateData.headers) {
        updateData.headers = JSON.stringify(updateData.headers);
      }

      const subscription = await prisma.webhookSubscription.update({
        where: { id },
        data: updateData
      });

      logger.info(`Webhook updated: ${id}`);
      return subscription;

    } catch (error) {
      logger.error('Error updating webhook:', error);
      throw error;
    }
  }

  /**
   * Delete webhook subscription
   */
  async deleteWebhook(id) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.webhookSubscription.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Webhook deleted: ${id}`);
      return true;

    } catch (error) {
      logger.error('Error deleting webhook:', error);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint(url, method = 'POST', headers = {}) {
    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        test: true
      };

      const requestHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'KOKOKA-Webhook-Test/1.0',
        ...headers
      };

      if (this.webhookSecret) {
        const signature = this.generateSignature(JSON.stringify(testPayload));
        requestHeaders['X-Signature'] = signature;
      }

      const response = await axios({
        method: method,
        url: url,
        data: testPayload,
        headers: requestHeaders,
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500
      });

      return {
        success: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'unknown'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get webhook delivery logs
   */
  async getDeliveryLogs(subscriptionId, options = {}) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const {
        page = 1,
        limit = 50,
        status = null,
        dateFrom = null,
        dateTo = null
      } = options;

      const skip = (page - 1) * limit;
      const where = { webhookSubscriptionId: subscriptionId };

      if (status) where.status = status;
      if (dateFrom) where.createdAt = { gte: new Date(dateFrom) };
      if (dateTo) {
        where.createdAt = where.createdAt || {};
        where.createdAt.lte = new Date(dateTo);
      }

      const [logs, total] = await Promise.all([
        prisma.webhookDeliveryLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.webhookDeliveryLog.count({ where })
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching webhook delivery logs:', error);
      throw error;
    }
  }

  /**
   * Log webhook delivery attempt
   */
  async logDelivery(subscriptionId, payload, result, error = null) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.webhookDeliveryLog.create({
        data: {
          webhookSubscriptionId: subscriptionId,
          payload: JSON.stringify(payload),
          status: result ? 'SUCCESS' : 'FAILED',
          statusCode: result?.statusCode || null,
          responseData: result ? JSON.stringify(result.responseData) : null,
          errorMessage: error,
          attempts: result?.attempt || 1,
          responseTime: result?.responseTime || null
        }
      });

    } catch (error) {
      logger.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * Sleep utility for retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get webhook channel status
   */
  getStatus() {
    return {
      enabled: process.env.WEBHOOK_NOTIFICATIONS_ENABLED === 'true',
      configured: !!this.webhookSecret,
      timeout: this.timeout,
      maxRetries: this.maxRetries
    };
  }

  /**
   * Send test webhook
   */
  async sendTestWebhook(url, headers = {}) {
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      test: true,
      message: 'This is a test webhook from KOKOKA School Management System'
    };

    const webhookConfig = { url, headers };
    
    try {
      const result = await this.sendWebhook(webhookConfig, testPayload);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bulk webhook delivery for multiple endpoints
   */
  async sendBulkWebhooks(webhookConfigs, payload) {
    const promises = webhookConfigs.map(async (config) => {
      try {
        const result = await this.sendWebhook(config, payload);
        return {
          url: config.url,
          success: true,
          result: result
        };
      } catch (error) {
        return {
          url: config.url,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      url: webhookConfigs[index].url,
      ...result.value
    }));
  }
}

module.exports = new WebhookChannel();