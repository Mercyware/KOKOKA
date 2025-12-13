/**
 * Email Worker
 *
 * Processes email jobs from the queue and sends emails using the email service
 */

// Load environment variables
require('dotenv').config();

const { emailQueue, EMAIL_JOBS } = require('../queues/emailQueue');
const emailService = require('../services/emailService');
const { sendEmail: sendEmailUtil } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Process email jobs
 */
emailQueue.process(async (job) => {
  const { name: jobType, data } = job;

  logger.info(`Processing email job: ${job.id}`, {
    type: jobType,
    recipient: data.to || data.email,
  });

  try {
    let result;

    switch (jobType) {
      case EMAIL_JOBS.SEND_EMAIL:
        result = await sendGenericEmail(data);
        break;

      case EMAIL_JOBS.SEND_WELCOME:
        result = await sendWelcomeEmail(data);
        break;

      case EMAIL_JOBS.SEND_PASSWORD_RESET:
        result = await sendPasswordResetEmail(data);
        break;

      case EMAIL_JOBS.SEND_VERIFICATION:
        result = await sendVerificationEmail(data);
        break;

      case EMAIL_JOBS.SEND_NOTIFICATION:
        result = await sendNotificationEmail(data);
        break;

      case EMAIL_JOBS.SEND_EXAM_RESULTS:
        result = await sendExamResultsEmail(data);
        break;

      case EMAIL_JOBS.SEND_FEE_REMINDER:
        result = await sendFeeReminderEmail(data);
        break;

      case EMAIL_JOBS.SEND_BULK_EMAIL:
        result = await sendBulkEmail(data);
        break;

      default:
        throw new Error(`Unknown email job type: ${jobType}`);
    }

    logger.info(`Email sent successfully: ${job.id}`, {
      type: jobType,
      messageId: result.messageId,
    });

    return result;
  } catch (error) {
    logger.error(`Failed to process email job: ${job.id}`, {
      type: jobType,
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw to trigger retry
  }
});

/**
 * Send generic email
 */
async function sendGenericEmail(data) {
  const { to, subject, text, html, from, cc, bcc, attachments } = data;

  // Use the email service if available, otherwise fall back to utils
  if (emailService.initialized) {
    return await emailService.sendEmail({ to, subject, text, html, from });
  } else {
    return await sendEmailUtil({ to, subject, text, html, from, cc, bcc, attachments });
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(data) {
  const { email, name, role, schoolName, subdomain } = data;

  // Try to use the newer emailService first
  if (emailService.initialized && emailService.sendRegistrationEmail) {
    return await emailService.sendRegistrationEmail({
      email,
      name,
      schoolName: schoolName || 'KOKOKA',
      subdomain,
    });
  }

  // Fall back to utils/email.js
  const subject = `Welcome to ${schoolName || 'KOKOKA School Management System'}`;
  const text = `Dear ${name},\n\nWelcome to ${schoolName || 'our School Management System'}! Your account has been created successfully as a ${role}.\n\nPlease log in to access your dashboard and features.\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to ${schoolName || 'KOKOKA School Management System'}</h2>
      <p>Dear ${name},</p>
      <p>Welcome to ${schoolName || 'our School Management System'}! Your account has been created successfully as a <strong>${role}</strong>.</p>
      <p>Please log in to access your dashboard and features.</p>
      ${subdomain ? `<p>Your school portal: <a href="https://${subdomain}.kokoka.com">https://${subdomain}.kokoka.com</a></p>` : ''}
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(data) {
  const { email, name, resetToken, resetUrl } = data;

  // Try to use the newer emailService first
  if (emailService.initialized && emailService.sendPasswordResetEmail) {
    return await emailService.sendPasswordResetEmail({
      email,
      name,
      resetToken,
    });
  }

  // Fall back to utils/email.js
  const subject = 'Password Reset Request';
  const text = `Dear ${name},\n\nYou requested a password reset. Please use the following link to reset your password: ${resetUrl || `[reset-url]?token=${resetToken}`}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>You requested a password reset. Please use the following link to reset your password:</p>
      <p><a href="${resetUrl || `[reset-url]?token=${resetToken}`}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send email verification
 */
async function sendVerificationEmail(data) {
  const { email, name, verificationToken, schoolName } = data;

  // Try to use the newer emailService first
  if (emailService.initialized && emailService.sendVerificationEmail) {
    return await emailService.sendVerificationEmail({
      email,
      name,
      verificationToken,
      schoolName,
    });
  }

  // Fall back to utils/email.js
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

  const subject = 'Verify Your Email Address';
  const text = `Dear ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Dear ${name},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send notification email
 */
async function sendNotificationEmail(data) {
  const { email, name, title, message, type } = data;

  const subject = `${title} - Notification`;
  const text = `Dear ${name},\n\n${message}\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>Dear ${name},</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
        <p>${message}</p>
      </div>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send exam results email
 */
async function sendExamResultsEmail(data) {
  const { email, name, exam, results } = data;
  const { title, subject: subjectName, totalMarks } = exam;
  const { score, grade } = results;

  const percentage = ((score / totalMarks) * 100).toFixed(2);

  const subject = `Exam Results: ${title}`;
  const text = `Dear ${name},\n\nYour results for the ${title} exam in ${subjectName} are now available.\n\nScore: ${score}/${totalMarks} (${percentage}%)\nGrade: ${grade}\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Exam Results: ${title}</h2>
      <p>Dear ${name},</p>
      <p>Your results for the <strong>${title}</strong> exam in <strong>${subjectName}</strong> are now available.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Score:</strong> ${score}/${totalMarks} (${percentage}%)</p>
        <p style="margin: 5px 0;"><strong>Grade:</strong> ${grade}</p>
      </div>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send fee reminder email
 */
async function sendFeeReminderEmail(data) {
  const { email, name, feeDetails } = data;
  const { description, totalAmount, amountPaid, balance, dueDate } = feeDetails;

  const formattedDueDate = new Date(dueDate).toLocaleDateString();

  const subject = `Fee Payment Reminder: ${description}`;
  const text = `Dear ${name},\n\nThis is a reminder that your payment for ${description} is due on ${formattedDueDate}.\n\nTotal Amount: $${totalAmount}\nAmount Paid: $${amountPaid}\nBalance Due: $${balance}\n\nPlease ensure timely payment to avoid any late fees.\n\nBest regards,\nSchool Management Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Fee Payment Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a reminder that your payment for <strong>${description}</strong> is due on <strong>${formattedDueDate}</strong>.</p>
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${totalAmount}</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amountPaid}</p>
        <p style="margin: 5px 0;"><strong>Balance Due:</strong> $${balance}</p>
      </div>
      <p>Please ensure timely payment to avoid any late fees.</p>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;

  return await sendEmailUtil({ to: email, subject, text, html });
}

/**
 * Send bulk email (same as generic but for batch processing)
 */
async function sendBulkEmail(data) {
  return await sendGenericEmail(data);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing email worker');
  await emailQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing email worker');
  await emailQueue.close();
  process.exit(0);
});

logger.info('✅ Email worker started and ready to process jobs');

module.exports = emailQueue;
