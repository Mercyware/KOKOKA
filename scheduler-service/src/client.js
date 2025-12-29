/**
 * Scheduler Service Client
 *
 * Client library for sending jobs to the scheduler service
 * This can be used by the backend to queue jobs
 */

const { createQueueProvider } = require('./providers');
const logger = require('./utils/logger');

class SchedulerClient {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || process.env.QUEUE_PROVIDER || 'aws-sqs',
      regularQueueUrl: config.regularQueueUrl || process.env.SQS_REGULAR_QUEUE_URL,
      priorityQueueUrl: config.priorityQueueUrl || process.env.SQS_PRIORITY_QUEUE_URL,
      ...config,
    };
    this.queueProvider = null;
    this.connected = false;
  }

  /**
   * Healthcheck: verify SQS queues are reachable
   * @returns {Promise<{priority: object, regular: object}>}
   */
  async healthcheck() {
    if (!this.connected) {
      await this.connect();
    }

    const results = {};
    const checks = [
      { name: 'priority', url: this.config.priorityQueueUrl },
      { name: 'regular', url: this.config.regularQueueUrl },
    ];

    for (const { name, url } of checks) {
      if (!url) {
        results[name] = { status: 'error', error: 'Queue URL not configured' };
        continue;
      }
      try {
        const attrs = await this.queueProvider.getQueueAttributes({ queueUrl: url });
        logger.info(`✅ SQS ${name} queue reachable`, { queueUrl: url, attributes: attrs });
        results[name] = { status: 'ok', attributes: attrs };
      } catch (error) {
        logger.error(`❌ SQS ${name} queue unreachable`, { queueUrl: url, error });
        results[name] = { status: 'error', error: error?.message || String(error) };
      }
    }

    return results;
  }

  /**
   * Initialize the client
   */
  async connect() {
    if (this.connected) return;

    try {
      this.queueProvider = createQueueProvider(this.config.provider, this.config);
      await this.queueProvider.connect();
      this.connected = true;
      logger.info('✅ Scheduler client connected');
    } catch (error) {
      logger.error('Failed to connect scheduler client:', error);
      throw error;
    }
  }

  /**
   * Send an email job
   * @param {Object} params
   * @param {string|string[]} params.to - Recipient email(s)
   * @param {string} params.subject - Email subject
   * @param {string} params.text - Plain text content
   * @param {string} params.html - HTML content
   * @param {string} [params.from] - Sender email
   * @param {string|string[]} [params.cc] - CC recipients
   * @param {string|string[]} [params.bcc] - BCC recipients
   * @param {Array} [params.attachments] - Email attachments
   * @param {number} [params.priority] - Priority (1=highest, 10=lowest)
   * @param {number} [params.delaySeconds] - Delay before sending
   * @returns {Promise<Object>} Job metadata
   */
  async sendEmail({
    to,
    subject,
    text,
    html,
    from,
    cc,
    bcc,
    attachments,
    priority = 5,
    delaySeconds = 0,
  }) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // Determine which queue to use based on priority
      const queueUrl = priority <= 3 ? this.config.priorityQueueUrl : this.config.regularQueueUrl;

      if (!queueUrl) {
        throw new Error('Queue URL not configured');
      }

      to = "mercyware@gmail.com";
      from = "mercyware@gmail.com";
      
      const message = {
        type: 'email',
        to,
        subject,
        text,
        html,
        from,
        cc,
        bcc,
        attachments,
        timestamp: Date.now(),
      };

      const result = await this.queueProvider.sendMessage({
        queueUrl,
        message,
        priority,
        options: {
          delaySeconds,
        },
      });

      logger.info('Email job queued', {
        messageId: result.messageId,
        to,
        subject,
        priority,
      });

      return result;
    } catch (error) {
      logger.error('Failed to queue email job:', error);
      throw error;
    }
  }

  /**
   * Send a welcome email
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.role - User role
   * @param {string} [params.schoolName] - School name
   * @param {string} [params.subdomain] - School subdomain
   * @param {string} [params.temporaryPassword] - Temporary password
   * @param {string} [params.employeeId] - Employee ID (for staff)
   * @param {string} [params.position] - Position (for staff)
   * @param {number} [params.priority] - Priority
   * @returns {Promise<Object>} Job metadata
   */
  async sendWelcomeEmail({
    email,
    name,
    role,
    schoolName,
    subdomain,
    temporaryPassword,
    employeeId,
    position,
    priority = 3,
  }) {
    const subject = `Welcome to ${schoolName || 'KOKOKA'}`;

    const text = `
Dear ${name},

Welcome to ${schoolName || 'KOKOKA School Management System'}!

Your account has been created successfully as a ${role}.
${employeeId ? `\nEmployee ID: ${employeeId}` : ''}
${position ? `Position: ${position}` : ''}

${temporaryPassword ? `Your temporary password is: ${temporaryPassword}\n\nPlease change your password after your first login.` : ''}

Please log in to access your dashboard.

Best regards,
${schoolName || 'KOKOKA'} Team
    `.trim();

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0891B2;">Welcome to ${schoolName || 'KOKOKA'}!</h2>
  <p>Dear ${name},</p>
  <p>Welcome to ${schoolName || 'KOKOKA School Management System'}!</p>
  <p>Your account has been created successfully as a <strong>${role}</strong>.</p>

  ${employeeId || position ? `
  <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0891B2; margin: 20px 0;">
    ${employeeId ? `<p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employeeId}</p>` : ''}
    ${position ? `<p style="margin: 5px 0;"><strong>Position:</strong> ${position}</p>` : ''}
  </div>
  ` : ''}

  ${temporaryPassword ? `
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 10px 0;"><strong>Temporary Password:</strong></p>
    <p style="margin: 10px 0; font-family: monospace; font-size: 18px; color: #0891B2;">${temporaryPassword}</p>
    <p style="margin: 10px 0; color: #dc2626;"><strong>⚠️ Please change your password after your first login.</strong></p>
  </div>
  ` : ''}

  <p>Please log in to access your dashboard.</p>

  ${subdomain ? `<p><a href="https://${subdomain}.kokoka.com" style="display: inline-block; padding: 12px 24px; background-color: #0891B2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Login Now</a></p>` : ''}

  <p style="margin-top: 30px;">Best regards,<br>${schoolName || 'KOKOKA'} Team</p>
</div>
    `.trim();

    return await this.sendEmail({
      to: email,
      subject,
      text,
      html,
      priority,
    });
  }

  /**
   * Send an email verification email
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.verificationToken - Verification token
   * @param {string} [params.schoolName] - School name
   * @param {number} [params.priority] - Priority
   * @returns {Promise<Object>} Job metadata
   */
  async sendVerificationEmail({
    email,
    name,
    verificationToken,
    schoolName,
    priority = 2,
  }) {
    const subject = `Verify Your Email - ${schoolName || 'KOKOKA'}`;
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const text = `
Dear ${name},

Thank you for registering with ${schoolName || 'KOKOKA School Management System'}!

Please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
${schoolName || 'KOKOKA'} Team
    `.trim();

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0891B2;">Verify Your Email</h2>
  <p>Dear ${name},</p>
  <p>Thank you for registering with ${schoolName || 'KOKOKA School Management System'}!</p>
  <p>Please verify your email address by clicking the button below:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0891B2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
  </div>

  <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
  <p style="color: #0891B2; font-size: 14px; word-break: break-all;">${verificationUrl}</p>

  <p style="margin-top: 30px; color: #64748b; font-size: 14px;">This verification link will expire in 24 hours.</p>
  <p style="color: #64748b; font-size: 14px;">If you did not create this account, please ignore this email.</p>

  <p style="margin-top: 30px;">Best regards,<br>${schoolName || 'KOKOKA'} Team</p>
</div>
    `.trim();

    return await this.sendEmail({
      to: email,
      subject,
      text,
      html,
      priority,
    });
  }

  /**
   * Disconnect the client
   */
  async disconnect() {
    if (this.queueProvider) {
      await this.queueProvider.disconnect();
      this.connected = false;
      logger.info('Scheduler client disconnected');
    }
  }
}

module.exports = SchedulerClient;
