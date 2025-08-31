const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

class EmailChannel {
  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize email providers
   */
  initializeProviders() {
    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendgridEnabled = true;
      logger.info('SendGrid email provider initialized');
    } else {
      this.sendgridEnabled = false;
      logger.warn('SendGrid API key not provided');
    }

    // Initialize Nodemailer as fallback
    if (process.env.NODEMAILER_ENABLED === 'true' && process.env.NODEMAILER_USER && process.env.NODEMAILER_PASS) {
      this.nodemailerTransporter = nodemailer.createTransporter({
        host: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.NODEMAILER_PORT) || 587,
        secure: process.env.NODEMAILER_SECURE === 'true',
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
        }
      });
      this.nodemailerEnabled = true;
      logger.info('Nodemailer email provider initialized');
    } else {
      this.nodemailerEnabled = false;
    }

    if (!this.sendgridEnabled && !this.nodemailerEnabled) {
      logger.warn('No email providers configured');
    }
  }

  /**
   * Send email notification
   * @param {Object} user - Target user
   * @param {Object} content - Notification content
   * @param {Object} notification - Notification object
   */
  async send(user, content, notification) {
    if (!user.email) {
      throw new Error('User email is required');
    }

    const emailData = {
      to: user.email,
      subject: content.emailSubject || content.title || notification.title,
      text: content.emailContent || content.message || notification.message,
      html: content.emailHtml,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@kokoka.com',
        name: process.env.SENDGRID_FROM_NAME || 'KOKOKA School Management'
      },
      replyTo: process.env.SENDGRID_REPLY_TO || 'support@kokoka.com'
    };

    // Try SendGrid first, then fallback to Nodemailer
    if (this.sendgridEnabled) {
      return await this.sendWithSendGrid(emailData, notification);
    } else if (this.nodemailerEnabled) {
      return await this.sendWithNodemailer(emailData, notification);
    } else {
      throw new Error('No email provider available');
    }
  }

  /**
   * Send email using SendGrid
   */
  async sendWithSendGrid(emailData, notification) {
    try {
      const message = {
        to: emailData.to,
        from: emailData.from,
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || this.generateHtmlFromText(emailData.text),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        customArgs: {
          notificationId: notification.id,
          schoolId: notification.schoolId,
          notificationType: notification.type
        }
      };

      // Add categories for better tracking
      message.categories = [
        'notification',
        notification.type.toLowerCase(),
        notification.category.toLowerCase()
      ];

      // Add attachments if present
      if (notification.metadata?.attachments) {
        message.attachments = notification.metadata.attachments.map(attachment => ({
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type,
          disposition: 'attachment'
        }));
      }

      const result = await sgMail.send(message);
      
      logger.info(`Email sent via SendGrid to ${emailData.to}`, {
        messageId: result[0].headers['x-message-id'],
        notificationId: notification.id
      });

      return {
        provider: 'sendgrid',
        messageId: result[0].headers['x-message-id'],
        status: 'sent',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('SendGrid email failed:', error);
      
      // If SendGrid fails and Nodemailer is available, try fallback
      if (this.nodemailerEnabled) {
        logger.info('Attempting fallback to Nodemailer');
        return await this.sendWithNodemailer(emailData, notification);
      }
      
      throw new Error(`SendGrid email failed: ${error.message}`);
    }
  }

  /**
   * Send email using Nodemailer
   */
  async sendWithNodemailer(emailData, notification) {
    try {
      const mailOptions = {
        from: `${emailData.from.name} <${emailData.from.email}>`,
        to: emailData.to,
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || this.generateHtmlFromText(emailData.text),
        headers: {
          'X-Notification-ID': notification.id,
          'X-School-ID': notification.schoolId,
          'X-Notification-Type': notification.type
        }
      };

      // Add attachments if present
      if (notification.metadata?.attachments) {
        mailOptions.attachments = notification.metadata.attachments.map(attachment => ({
          content: attachment.content,
          filename: attachment.filename,
          contentType: attachment.type
        }));
      }

      const result = await this.nodemailerTransporter.sendMail(mailOptions);
      
      logger.info(`Email sent via Nodemailer to ${emailData.to}`, {
        messageId: result.messageId,
        notificationId: notification.id
      });

      return {
        provider: 'nodemailer',
        messageId: result.messageId,
        status: 'sent',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Nodemailer email failed:', error);
      throw new Error(`Nodemailer email failed: ${error.message}`);
    }
  }

  /**
   * Generate basic HTML from text content
   */
  generateHtmlFromText(text) {
    if (!text) return '';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
            text-align: center; 
        }
        .content { 
            background: #ffffff; 
            padding: 30px; 
            border: 1px solid #e5e7eb; 
            border-top: none; 
        }
        .footer { 
            background: #f9fafb; 
            padding: 20px; 
            border: 1px solid #e5e7eb; 
            border-top: none; 
            border-radius: 0 0 8px 8px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin: 0; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="logo">KOKOKA</h1>
        <p style="margin: 0;">School Management System</p>
    </div>
    <div class="content">
        ${text.replace(/\n/g, '<br>')}
    </div>
    <div class="footer">
        <p>This is an automated message from KOKOKA School Management System.</p>
        <p>Please do not reply to this email.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Handle SendGrid webhook events
   */
  async handleWebhook(events) {
    for (const event of events) {
      try {
        const { notificationId, schoolId } = event.customArgs || {};
        
        if (!notificationId) continue;

        const deliveryStatus = this.mapSendGridEventToStatus(event.event);
        
        // Update delivery log
        await this.updateDeliveryStatus(notificationId, event.email, deliveryStatus, event);
        
        logger.info(`Email webhook processed: ${event.event} for notification ${notificationId}`);
        
      } catch (error) {
        logger.error('Error processing email webhook:', error);
      }
    }
  }

  /**
   * Map SendGrid event types to our delivery status
   */
  mapSendGridEventToStatus(eventType) {
    const statusMap = {
      'processed': 'SENT',
      'delivered': 'DELIVERED', 
      'open': 'DELIVERED',
      'click': 'DELIVERED',
      'bounce': 'BOUNCED',
      'dropped': 'FAILED',
      'deferred': 'PENDING',
      'blocked': 'REJECTED',
      'spam_report': 'REJECTED',
      'unsubscribe': 'DELIVERED'
    };

    return statusMap[eventType] || 'SENT';
  }

  /**
   * Update delivery status in database
   */
  async updateDeliveryStatus(notificationId, email, status, eventData) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.notificationDeliveryLog.updateMany({
        where: {
          notificationId,
          recipient: email,
          channel: 'EMAIL'
        },
        data: {
          status,
          providerResponse: JSON.stringify(eventData),
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
          failedAt: ['FAILED', 'BOUNCED', 'REJECTED'].includes(status) ? new Date() : undefined
        }
      });

    } catch (error) {
      logger.error('Error updating delivery status:', error);
    }
  }

  /**
   * Verify email provider configuration
   */
  async verifyConfiguration() {
    const results = {
      sendgrid: false,
      nodemailer: false,
      overall: false
    };

    // Test SendGrid
    if (this.sendgridEnabled) {
      try {
        // SendGrid doesn't have a simple verification endpoint
        // We'll just check if the API key is set
        results.sendgrid = !!process.env.SENDGRID_API_KEY;
      } catch (error) {
        logger.error('SendGrid verification failed:', error);
      }
    }

    // Test Nodemailer
    if (this.nodemailerEnabled) {
      try {
        await this.nodemailerTransporter.verify();
        results.nodemailer = true;
      } catch (error) {
        logger.error('Nodemailer verification failed:', error);
      }
    }

    results.overall = results.sendgrid || results.nodemailer;
    return results;
  }

  /**
   * Get email provider status
   */
  getStatus() {
    return {
      sendgrid: {
        enabled: this.sendgridEnabled,
        configured: !!process.env.SENDGRID_API_KEY
      },
      nodemailer: {
        enabled: this.nodemailerEnabled,
        configured: !!(process.env.NODEMAILER_USER && process.env.NODEMAILER_PASS)
      }
    };
  }

  /**
   * Send test email
   */
  async sendTest(toEmail, testType = 'basic') {
    const testContent = {
      title: 'Test Email from KOKOKA',
      emailSubject: 'Test Email - KOKOKA School Management System',
      emailContent: `This is a test email from the KOKOKA School Management System.

Test Type: ${testType}
Sent At: ${new Date().toLocaleString()}

If you received this email, your email configuration is working correctly.

Best regards,
KOKOKA System Administrator`,
      emailHtml: this.generateHtmlFromText(`This is a test email from the KOKOKA School Management System.

<strong>Test Type:</strong> ${testType}<br>
<strong>Sent At:</strong> ${new Date().toLocaleString()}

<p>If you received this email, your email configuration is working correctly.</p>

<p>Best regards,<br>KOKOKA System Administrator</p>`)
    };

    const testNotification = {
      id: 'test-email-' + Date.now(),
      schoolId: 'test',
      type: 'SYSTEM',
      title: testContent.title,
      message: testContent.emailContent
    };

    const testUser = { email: toEmail };

    return await this.send(testUser, testContent, testNotification);
  }
}

module.exports = new EmailChannel();