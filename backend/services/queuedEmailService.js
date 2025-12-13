/**
 * Queued Email Service
 *
 * A simple wrapper service that provides easy-to-use methods for sending emails
 * through the queue system. This decouples email sending from the main application
 * flow and provides automatic retries, scheduling, and monitoring.
 */

const {
  queueEmail,
  queueWelcomeEmail,
  queuePasswordResetEmail,
  queueVerificationEmail,
  queueNotificationEmail,
  queueExamResultsEmail,
  queueFeeReminderEmail,
  queueBulkEmails,
  getQueueStats,
} = require('../queues/emailQueue');
const logger = require('../utils/logger');

class QueuedEmailService {
  /**
   * Send a generic email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @param {string} options.from - Sender (optional)
   * @param {string|string[]} options.cc - CC recipients (optional)
   * @param {string|string[]} options.bcc - BCC recipients (optional)
   * @param {Array} options.attachments - Email attachments (optional)
   * @param {number} options.priority - Job priority (1-10, lower is higher priority)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendEmail(options) {
    try {
      const job = await queueEmail(options);
      logger.info('Email queued successfully', { jobId: job.id, recipient: options.to });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} options
   * @param {string} options.email - User email
   * @param {string} options.name - User name
   * @param {string} options.role - User role
   * @param {string} options.schoolName - School name (optional)
   * @param {string} options.subdomain - School subdomain (optional)
   * @param {number} options.priority - Job priority (default: 3)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendWelcomeEmail(options) {
    try {
      const job = await queueWelcomeEmail(options);
      logger.info('Welcome email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue welcome email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} options
   * @param {string} options.email - User email
   * @param {string} options.name - User name
   * @param {string} options.resetToken - Password reset token
   * @param {string} options.resetUrl - Password reset URL (optional)
   * @param {number} options.priority - Job priority (default: 1)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendPasswordResetEmail(options) {
    try {
      const job = await queuePasswordResetEmail(options);
      logger.info('Password reset email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue password reset email:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   * @param {Object} options
   * @param {string} options.email - User email
   * @param {string} options.name - User name
   * @param {string} options.verificationToken - Email verification token
   * @param {string} options.schoolName - School name (optional)
   * @param {number} options.priority - Job priority (default: 2)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendVerificationEmail(options) {
    try {
      const job = await queueVerificationEmail(options);
      logger.info('Verification email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue verification email:', error);
      throw error;
    }
  }

  /**
   * Send notification email
   * @param {Object} options
   * @param {string} options.email - User email
   * @param {string} options.name - User name
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {string} options.type - Notification type (optional)
   * @param {number} options.priority - Job priority (default: 5)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendNotificationEmail(options) {
    try {
      const job = await queueNotificationEmail(options);
      logger.info('Notification email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue notification email:', error);
      throw error;
    }
  }

  /**
   * Send exam results email
   * @param {Object} options
   * @param {string} options.email - Student email
   * @param {string} options.name - Student name
   * @param {Object} options.exam - Exam details
   * @param {Object} options.results - Exam results
   * @param {number} options.priority - Job priority (default: 4)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendExamResultsEmail(options) {
    try {
      const job = await queueExamResultsEmail(options);
      logger.info('Exam results email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue exam results email:', error);
      throw error;
    }
  }

  /**
   * Send fee reminder email
   * @param {Object} options
   * @param {string} options.email - Student/Parent email
   * @param {string} options.name - Student/Parent name
   * @param {Object} options.feeDetails - Fee details
   * @param {number} options.priority - Job priority (default: 6)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendFeeReminderEmail(options) {
    try {
      const job = await queueFeeReminderEmail(options);
      logger.info('Fee reminder email queued', { jobId: job.id, recipient: options.email });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue fee reminder email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   * @param {Array} emails - Array of email objects
   * @param {Object} options - Bulk email options
   * @param {number} options.priority - Job priority (default: 7)
   * @param {number} options.delay - Delay before sending in milliseconds
   */
  async sendBulkEmails(emails, options = {}) {
    try {
      const jobs = await queueBulkEmails(emails, options);
      logger.info('Bulk emails queued', { count: jobs.length });
      return { success: true, count: jobs.length, jobIds: jobs.map(j => j.id) };
    } catch (error) {
      logger.error('Failed to queue bulk emails:', error);
      throw error;
    }
  }

  /**
   * Get email queue statistics
   * @returns {Promise<Object>} Queue statistics
   */
  async getStats() {
    try {
      const stats = await getQueueStats();
      return stats;
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  /**
   * Schedule an email to be sent at a specific time
   * @param {Object} emailOptions - Email options
   * @param {Date|number} scheduledTime - When to send (Date object or timestamp)
   */
  async scheduleEmail(emailOptions, scheduledTime) {
    const delay = typeof scheduledTime === 'number'
      ? scheduledTime - Date.now()
      : scheduledTime.getTime() - Date.now();

    if (delay < 0) {
      throw new Error('Scheduled time must be in the future');
    }

    return await this.sendEmail({ ...emailOptions, delay });
  }
}

// Export singleton instance
module.exports = new QueuedEmailService();
