/**
 * Email Job Processor
 *
 * Processes email sending jobs from the queue
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailJobProcessor {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter based on provider
   */
  async initialize() {
    try {
      const provider = config.email.provider;

      switch (provider) {
        case 'ses':
          this.transporter = nodemailer.createTransport({
            host: config.email.ses.host,
            port: config.email.ses.port,
            secure: false, // Use STARTTLS
            auth: {
              user: config.email.ses.user,
              pass: config.email.ses.password,
            },
          });
          break;

        case 'sendgrid':
          // SendGrid via nodemailer
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(config.email.sendgrid.apiKey);
          this.transporter = {
            sendMail: async (mailOptions) => {
              const msg = {
                to: mailOptions.to,
                from: mailOptions.from,
                subject: mailOptions.subject,
                text: mailOptions.text,
                html: mailOptions.html,
              };
              return await sgMail.send(msg);
            },
          };
          break;

        case 'smtp':
          this.transporter = nodemailer.createTransport({
            host: config.email.smtp.host,
            port: config.email.smtp.port,
            secure: config.email.smtp.secure,
            auth: {
              user: config.email.smtp.user,
              pass: config.email.smtp.password,
            },
          });
          break;

        default:
          throw new Error(`Unknown email provider: ${provider}`);
      }

      // Verify connection
      if (this.transporter.verify) {
        await this.transporter.verify();
      }

      this.initialized = true;
      logger.info(`✅ Email service initialized with ${provider.toUpperCase()}`);
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Process an email job
   * @param {Object} job - Job data from queue
   */
  async process(job) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { to, subject, text, html, from, cc, bcc, attachments } = job.body;

    try {
      logger.info('Processing email job', {
        jobId: job.id,
        to,
        subject,
      });

      // for testing Purposes. All main goes to mercyware@gmail.com

      const mailOptions = {
        from: from || `"${config.email.fromName}" <${config.email.from}>`,
        to: "mercyware@gmail.com", // Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
        ...(cc && { cc: Array.isArray(cc) ? cc.join(', ') : cc }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc }),
        ...(attachments && { attachments }),
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        jobId: job.id,
        to,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      logger.error('Failed to send email', {
        jobId: job.id,
        to,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Handle job failure
   * @param {Object} job - Failed job
   * @param {Error} error - Error that caused failure
   */
  async handleFailure(job, error) {
    logger.error('Email job failed permanently', {
      jobId: job.id,
      to: job.body.to,
      error: error.message,
      receiveCount: job.approximateReceiveCount,
    });

    // TODO: Implement dead letter queue handling
    // - Move to DLQ
    // - Send admin notification
    // - Log to monitoring system
  }
}

module.exports = EmailJobProcessor;
