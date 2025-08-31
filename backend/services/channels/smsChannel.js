const twilio = require('twilio');
const AWS = require('@aws-sdk/client-sns');
const logger = require('../../utils/logger');

class SMSChannel {
  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize SMS providers
   */
  initializeProviders() {
    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioEnabled = true;
      this.twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
      logger.info('Twilio SMS provider initialized');
    } else {
      this.twilioEnabled = false;
      logger.warn('Twilio credentials not provided');
    }

    // Initialize AWS SNS
    if (process.env.AWS_SNS_ENABLED === 'true' && 
        process.env.AWS_SNS_ACCESS_KEY_ID && 
        process.env.AWS_SNS_SECRET_ACCESS_KEY) {
      
      this.snsClient = new AWS.SNSClient({
        region: process.env.AWS_SNS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY
        }
      });
      this.snsEnabled = true;
      logger.info('AWS SNS SMS provider initialized');
    } else {
      this.snsEnabled = false;
    }

    // Initialize Vonage (formerly Nexmo)
    if (process.env.VONAGE_ENABLED === 'true' && 
        process.env.VONAGE_API_KEY && 
        process.env.VONAGE_API_SECRET) {
      
      const { Vonage } = require('@vonage/server-sdk');
      this.vonageClient = new Vonage({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
      });
      this.vonageEnabled = true;
      this.vonageFrom = process.env.VONAGE_FROM || 'KOKOKA';
      logger.info('Vonage SMS provider initialized');
    } else {
      this.vonageEnabled = false;
    }

    if (!this.twilioEnabled && !this.snsEnabled && !this.vonageEnabled) {
      logger.warn('No SMS providers configured');
    }

    // Set default country code
    this.defaultCountryCode = process.env.SMS_DEFAULT_COUNTRY_CODE || '+1';
  }

  /**
   * Send SMS notification
   * @param {Object} user - Target user
   * @param {Object} content - Notification content
   * @param {Object} notification - Notification object
   */
  async send(user, content, notification) {
    const phoneNumber = this.getUserPhoneNumber(user);
    
    if (!phoneNumber) {
      throw new Error('User phone number is required');
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const message = content.smsContent || content.message || notification.message;
    
    if (!message) {
      throw new Error('SMS message content is required');
    }

    // Try providers in order of preference
    const providers = this.getEnabledProviders();
    let lastError;

    for (const provider of providers) {
      try {
        const result = await this.sendWithProvider(provider, formattedPhone, message, notification);
        logger.info(`SMS sent via ${provider} to ${formattedPhone}`, {
          messageId: result.messageId,
          notificationId: notification.id
        });
        return result;
      } catch (error) {
        logger.warn(`SMS failed with ${provider}: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All SMS providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get user phone number from various sources
   */
  getUserPhoneNumber(user) {
    // Check user directly
    if (user.phone) return user.phone;
    
    // Check student profile
    if (user.student?.phone) return user.student.phone;
    
    // Check teacher profile
    if (user.teacher?.phone) return user.teacher.phone;
    
    // Check staff profile
    if (user.staff?.phone) return user.staff.phone;
    
    return null;
  }

  /**
   * Format phone number for international SMS
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, add default country code
    if (!cleaned.startsWith('+')) {
      // If it starts with country code digits (like 1 for US), keep as is
      // Otherwise add default country code
      if (!cleaned.match(/^[1-9]\d{10,}$/)) {
        cleaned = this.defaultCountryCode + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * Get list of enabled providers in order of preference
   */
  getEnabledProviders() {
    const providers = [];
    
    // Preferred order: Twilio, AWS SNS, Vonage
    if (this.twilioEnabled) providers.push('twilio');
    if (this.snsEnabled) providers.push('sns');
    if (this.vonageEnabled) providers.push('vonage');
    
    return providers;
  }

  /**
   * Send SMS with specific provider
   */
  async sendWithProvider(provider, phoneNumber, message, notification) {
    switch (provider) {
      case 'twilio':
        return await this.sendWithTwilio(phoneNumber, message, notification);
      case 'sns':
        return await this.sendWithSNS(phoneNumber, message, notification);
      case 'vonage':
        return await this.sendWithVonage(phoneNumber, message, notification);
      default:
        throw new Error(`Unknown SMS provider: ${provider}`);
    }
  }

  /**
   * Send SMS using Twilio
   */
  async sendWithTwilio(phoneNumber, message, notification) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioFromNumber,
        to: phoneNumber,
        // Add custom parameters for tracking
        statusCallback: process.env.TWILIO_WEBHOOK_URL,
        metadata: {
          notificationId: notification.id,
          schoolId: notification.schoolId,
          type: notification.type
        }
      });

      return {
        provider: 'twilio',
        messageId: result.sid,
        status: 'sent',
        timestamp: new Date().toISOString(),
        phoneNumber: phoneNumber,
        cost: result.price,
        direction: result.direction
      };

    } catch (error) {
      logger.error('Twilio SMS error:', error);
      throw new Error(`Twilio SMS failed: ${error.message}`);
    }
  }

  /**
   * Send SMS using AWS SNS
   */
  async sendWithSNS(phoneNumber, message, notification) {
    try {
      const params = {
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          },
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'KOKOKA'
          },
          'NotificationId': {
            DataType: 'String',
            StringValue: notification.id
          },
          'SchoolId': {
            DataType: 'String',
            StringValue: notification.schoolId
          }
        }
      };

      const command = new AWS.PublishCommand(params);
      const result = await this.snsClient.send(command);

      return {
        provider: 'sns',
        messageId: result.MessageId,
        status: 'sent',
        timestamp: new Date().toISOString(),
        phoneNumber: phoneNumber
      };

    } catch (error) {
      logger.error('AWS SNS SMS error:', error);
      throw new Error(`AWS SNS SMS failed: ${error.message}`);
    }
  }

  /**
   * Send SMS using Vonage
   */
  async sendWithVonage(phoneNumber, message, notification) {
    try {
      const result = await this.vonageClient.sms.send({
        to: phoneNumber.replace('+', ''),
        from: this.vonageFrom,
        text: message,
        clientRef: notification.id
      });

      if (result.messages[0].status !== '0') {
        throw new Error(`Vonage error: ${result.messages[0]['error-text']}`);
      }

      return {
        provider: 'vonage',
        messageId: result.messages[0]['message-id'],
        status: 'sent',
        timestamp: new Date().toISOString(),
        phoneNumber: phoneNumber,
        cost: result.messages[0]['message-price'],
        remainingBalance: result.messages[0]['remaining-balance']
      };

    } catch (error) {
      logger.error('Vonage SMS error:', error);
      throw new Error(`Vonage SMS failed: ${error.message}`);
    }
  }

  /**
   * Handle SMS delivery webhooks
   */
  async handleWebhook(provider, data) {
    try {
      let notificationId, status, phoneNumber;

      switch (provider) {
        case 'twilio':
          notificationId = data.metadata?.notificationId;
          status = this.mapTwilioStatusToOurs(data.MessageStatus);
          phoneNumber = data.To;
          break;
          
        case 'sns':
          // AWS SNS webhook handling would go here
          // SNS typically sends delivery reports via CloudWatch
          break;
          
        case 'vonage':
          notificationId = data.clientRef;
          status = this.mapVonageStatusToOurs(data.status);
          phoneNumber = '+' + data.to;
          break;
      }

      if (notificationId && status && phoneNumber) {
        await this.updateDeliveryStatus(notificationId, phoneNumber, status, data);
      }

    } catch (error) {
      logger.error('SMS webhook processing error:', error);
    }
  }

  /**
   * Map Twilio status to our delivery status
   */
  mapTwilioStatusToOurs(twilioStatus) {
    const statusMap = {
      'queued': 'PENDING',
      'sent': 'SENT',
      'delivered': 'DELIVERED',
      'undelivered': 'FAILED',
      'failed': 'FAILED',
      'received': 'DELIVERED'
    };

    return statusMap[twilioStatus] || 'SENT';
  }

  /**
   * Map Vonage status to our delivery status
   */
  mapVonageStatusToOurs(vonageStatus) {
    const statusMap = {
      'delivered': 'DELIVERED',
      'expired': 'FAILED',
      'failed': 'FAILED',
      'rejected': 'REJECTED',
      'unknown': 'SENT'
    };

    return statusMap[vonageStatus] || 'SENT';
  }

  /**
   * Update delivery status in database
   */
  async updateDeliveryStatus(notificationId, phoneNumber, status, webhookData) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.notificationDeliveryLog.updateMany({
        where: {
          notificationId,
          recipient: phoneNumber,
          channel: 'SMS'
        },
        data: {
          status,
          providerResponse: JSON.stringify(webhookData),
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
          failedAt: ['FAILED', 'REJECTED'].includes(status) ? new Date() : undefined
        }
      });

    } catch (error) {
      logger.error('Error updating SMS delivery status:', error);
    }
  }

  /**
   * Verify SMS provider configurations
   */
  async verifyConfiguration() {
    const results = {
      twilio: false,
      sns: false,
      vonage: false,
      overall: false
    };

    // Test Twilio
    if (this.twilioEnabled) {
      try {
        await this.twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        results.twilio = true;
      } catch (error) {
        logger.error('Twilio verification failed:', error);
      }
    }

    // Test AWS SNS
    if (this.snsEnabled) {
      try {
        const command = new AWS.GetSMSAttributesCommand({});
        await this.snsClient.send(command);
        results.sns = true;
      } catch (error) {
        logger.error('AWS SNS verification failed:', error);
      }
    }

    // Test Vonage
    if (this.vonageEnabled) {
      try {
        // Vonage doesn't have a simple verification method
        // We'll just check if credentials are provided
        results.vonage = !!(process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET);
      } catch (error) {
        logger.error('Vonage verification failed:', error);
      }
    }

    results.overall = results.twilio || results.sns || results.vonage;
    return results;
  }

  /**
   * Get SMS provider status
   */
  getStatus() {
    return {
      twilio: {
        enabled: this.twilioEnabled,
        configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        fromNumber: this.twilioFromNumber
      },
      sns: {
        enabled: this.snsEnabled,
        configured: !!(process.env.AWS_SNS_ACCESS_KEY_ID && process.env.AWS_SNS_SECRET_ACCESS_KEY),
        region: process.env.AWS_SNS_REGION
      },
      vonage: {
        enabled: this.vonageEnabled,
        configured: !!(process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET),
        from: this.vonageFrom
      }
    };
  }

  /**
   * Send test SMS
   */
  async sendTest(toPhone, testType = 'basic') {
    const formattedPhone = this.formatPhoneNumber(toPhone);
    
    const testMessage = `Test SMS from KOKOKA School Management System.

Test Type: ${testType}
Sent At: ${new Date().toLocaleString()}

If you received this message, your SMS configuration is working correctly.`;

    const testNotification = {
      id: 'test-sms-' + Date.now(),
      schoolId: 'test',
      type: 'SYSTEM',
      title: 'Test SMS',
      message: testMessage
    };

    const testUser = { phone: toPhone };
    const testContent = { smsContent: testMessage };

    return await this.send(testUser, testContent, testNotification);
  }

  /**
   * Get SMS pricing information (if available from provider)
   */
  async getPricingInfo(phoneNumber) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const pricing = {};

    // Get Twilio pricing
    if (this.twilioEnabled) {
      try {
        const country = formattedPhone.substring(1, 3);
        // This would require Twilio Pricing API
        // pricing.twilio = await this.twilioClient.pricing.messaging.countries(country).fetch();
      } catch (error) {
        logger.warn('Could not fetch Twilio pricing:', error.message);
      }
    }

    return pricing;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    
    const formatted = this.formatPhoneNumber(phoneNumber);
    
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(formatted);
  }

  /**
   * Get delivery report for a message
   */
  async getDeliveryReport(messageId, provider) {
    try {
      switch (provider) {
        case 'twilio':
          if (this.twilioEnabled) {
            return await this.twilioClient.messages(messageId).fetch();
          }
          break;
          
        case 'vonage':
          if (this.vonageEnabled) {
            return await this.vonageClient.sms.search({
              messageId: messageId
            });
          }
          break;
      }
    } catch (error) {
      logger.error(`Error fetching delivery report for ${provider}:`, error);
    }
    
    return null;
  }
}

module.exports = new SMSChannel();