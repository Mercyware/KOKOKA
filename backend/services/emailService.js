/**
 * Email Service
 *
 * Handles all email sending functionality using Amazon SES via nodemailer
 */

const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const logger = require('../utils/logger');

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

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to KOKOKA</h1>
    </div>
    <div class="content">
      <h2>Hello ${name}!</h2>
      <p>Thank you for registering your school, <strong>${schoolName}</strong>, with KOKOKA School Management System.</p>

      <div class="info-box">
        <p><strong>Your School Details:</strong></p>
        <p>
          School Name: ${schoolName}<br>
          Subdomain: ${subdomain}<br>
          Access URL: <a href="https://${subdomain}.kokoka.com">https://${subdomain}.kokoka.com</a>
        </p>
      </div>

      <p>Your account has been created successfully. Please verify your email address to activate your account and gain full access to all features.</p>

      <p>If you didn't create this account, please ignore this email or contact our support team.</p>

      <p>Best regards,<br>The KOKOKA Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KOKOKA School Management System. All rights reserved.</p>
      <p>Need help? Contact us at <a href="mailto:${emailConfig.from.support}">support@kokoka.com</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Welcome to KOKOKA, ${name}!

Thank you for registering your school, ${schoolName}, with KOKOKA School Management System.

Your School Details:
- School Name: ${schoolName}
- Subdomain: ${subdomain}
- Access URL: https://${subdomain}.kokoka.com

Your account has been created successfully. Please verify your email address to activate your account and gain full access to all features.

If you didn't create this account, please ignore this email or contact our support team at ${emailConfig.from.support}.

Best regards,
The KOKOKA Team
    `;

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

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background: #5568d3;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello ${name}!</h2>
      <p>Thank you for signing up${schoolName ? ` with ${schoolName}` : ' with KOKOKA'}. We're excited to have you on board!</p>

      <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>

      <center>
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </center>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>

      <div class="info-box">
        <p><strong>⏰ This verification link will expire in ${emailConfig.verification.tokenExpiry} hours.</strong></p>
      </div>

      <p>If you didn't create this account, please ignore this email or contact our support team.</p>

      <p>Best regards,<br>The KOKOKA Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KOKOKA School Management System. All rights reserved.</p>
      <p>Need help? Contact us at <a href="mailto:${emailConfig.from.support}">support@kokoka.com</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hello ${name}!

Thank you for signing up${schoolName ? ` with ${schoolName}` : ' with KOKOKA'}. We're excited to have you on board!

To complete your registration and activate your account, please verify your email address by clicking the link below:

${verificationUrl}

⏰ This verification link will expire in ${emailConfig.verification.tokenExpiry} hours.

If you didn't create this account, please ignore this email or contact our support team at ${emailConfig.from.support}.

Best regards,
The KOKOKA Team
    `;

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

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello ${name}!</h2>
      <p>We received a request to reset your password for your KOKOKA account.</p>

      <p>Click the button below to reset your password:</p>

      <center>
        <a href="${resetUrl}" class="button">Reset Password</a>
      </center>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

      <div class="warning-box">
        <p><strong>⏰ This reset link will expire in ${process.env.PASSWORD_RESET_EXPIRE || 10} minutes.</strong></p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
      </div>

      <p>Best regards,<br>The KOKOKA Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KOKOKA School Management System. All rights reserved.</p>
      <p>Need help? Contact us at <a href="mailto:${emailConfig.from.support}">support@kokoka.com</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hello ${name}!

We received a request to reset your password for your KOKOKA account.

Click the link below to reset your password:
${resetUrl}

⏰ This reset link will expire in ${process.env.PASSWORD_RESET_EXPIRE || 10} minutes.

If you didn't request a password reset, please ignore this email or contact support at ${emailConfig.from.support} if you have concerns about your account security.

Best regards,
The KOKOKA Team
    `;

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
