/**
 * Email Service
 *
 * Handles all email sending functionality using Amazon SES via nodemailer
 */

const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const logger = require('../utils/logger');
const { loadEmailTemplate } = require('../utils/emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter with SES SMTP configuration
   */
  initializeTransporter() {
    if (!emailConfig.enabled) {
      logger.warn('Email service is disabled in configuration');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: {
          user: emailConfig.smtp.auth.user,
          pass: emailConfig.smtp.auth.pass,
        },
      });

      this.initialized = true;
      logger.info('✅ Email service initialized with Amazon SES');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.initialized = false;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    if (!this.initialized) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('✅ SMTP connection verified');
      return true;
    } catch (error) {
      logger.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @param {string} options.from - Sender (optional, uses default if not provided)
   */
  async sendEmail({ to, subject, text, html, from }) {
    if (!this.initialized) {
      throw new Error('Email service is not initialized');
    }

    try {
      const mailOptions = {
        from: from || emailConfig.from.default,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`, { messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send registration welcome email
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.schoolName - School name
   * @param {string} params.subdomain - School subdomain
   */
  async sendRegistrationEmail({ email, name, schoolName, subdomain }) {
    const subject = `Welcome to ${schoolName} - Complete Your Registration`;

    const { html, text } = await loadEmailTemplate('registration', {
      headerTitle: 'Welcome to KOKOKA',
      name,
      schoolName,
      subdomain,
    });

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send email verification email
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.verificationToken - Verification token
   * @param {string} params.schoolName - School name (optional)
   */
  async sendVerificationEmail({ email, name, verificationToken, schoolName }) {
    const verificationUrl = `${emailConfig.urls.frontend}/auth/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email Address - KOKOKA';

    const { html, text } = await loadEmailTemplate('verification', {
      headerTitle: 'Verify Your Email',
      name,
      schoolName,
      verificationUrl,
      tokenExpiry: emailConfig.verification.tokenExpiry,
    });

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.resetToken - Password reset token
   */
  async sendPasswordResetEmail({ email, name, resetToken }) {
    const resetUrl = `${emailConfig.urls.frontend}/auth/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - KOKOKA';

    const { html, text } = await loadEmailTemplate('password-reset', {
      headerTitle: 'Password Reset Request',
      name,
      resetUrl,
      expiryMinutes: process.env.PASSWORD_RESET_EXPIRE || 10,
    });

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
