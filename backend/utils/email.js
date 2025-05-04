const nodemailer = require('nodemailer');

// Configuration for email service
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Send email
exports.sendEmail = async (options) => {
  try {
    const { to, subject, text, html, attachments, cc, bcc, from } = options;
    
    // Validate required fields
    if (!to) {
      throw new Error('Recipient email is required');
    }
    
    if (!subject) {
      throw new Error('Email subject is required');
    }
    
    if (!text && !html) {
      throw new Error('Email content (text or html) is required');
    }
    
    // Create email options
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'School Management System <noreply@school.com>',
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send welcome email to new user
exports.sendWelcomeEmail = async (user) => {
  try {
    const { email, name, role } = user;
    
    const subject = 'Welcome to School Management System';
    const text = `Dear ${name},\n\nWelcome to our School Management System! Your account has been created successfully as a ${role}.\n\nPlease log in to access your dashboard and features.\n\nBest regards,\nSchool Management Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to School Management System</h2>
        <p>Dear ${name},</p>
        <p>Welcome to our School Management System! Your account has been created successfully as a <strong>${role}</strong>.</p>
        <p>Please log in to access your dashboard and features.</p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken, resetUrl) => {
  try {
    const { email, name } = user;
    
    const subject = 'Password Reset Request';
    const text = `Dear ${name},\n\nYou requested a password reset. Please use the following link to reset your password: ${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nSchool Management Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested a password reset. Please use the following link to reset your password:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Send notification email
exports.sendNotificationEmail = async (user, notification) => {
  try {
    const { email, name } = user;
    const { title, message, type } = notification;
    
    const subject = `${title} - Notification`;
    const text = `Dear ${name},\n\n${message}\n\nBest regards,\nSchool Management Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>Dear ${name},</p>
        <p>${message}</p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw new Error(`Failed to send notification email: ${error.message}`);
  }
};

// Send exam results email
exports.sendExamResultsEmail = async (student, exam, results) => {
  try {
    const { email, name } = student;
    const { title, subject: subjectName, totalMarks } = exam;
    const { score, grade } = results;
    
    const percentage = ((score / totalMarks) * 100).toFixed(2);
    
    const emailSubject = `Exam Results: ${title}`;
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
    
    return await this.sendEmail({
      to: email,
      subject: emailSubject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending exam results email:', error);
    throw new Error(`Failed to send exam results email: ${error.message}`);
  }
};

// Send fee reminder email
exports.sendFeeReminderEmail = async (student, feeDetails) => {
  try {
    const { email, name } = student;
    const { description, totalAmount, amountPaid, balance, dueDate } = feeDetails;
    
    const formattedDueDate = new Date(dueDate).toLocaleDateString();
    
    const emailSubject = `Fee Payment Reminder: ${description}`;
    const text = `Dear ${name},\n\nThis is a reminder that your payment for ${description} is due on ${formattedDueDate}.\n\nTotal Amount: $${totalAmount}\nAmount Paid: $${amountPaid}\nBalance Due: $${balance}\n\nPlease ensure timely payment to avoid any late fees.\n\nBest regards,\nSchool Management Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Fee Payment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that your payment for <strong>${description}</strong> is due on <strong>${formattedDueDate}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${totalAmount}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amountPaid}</p>
          <p style="margin: 5px 0;"><strong>Balance Due:</strong> $${balance}</p>
        </div>
        <p>Please ensure timely payment to avoid any late fees.</p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: email,
      subject: emailSubject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending fee reminder email:', error);
    throw new Error(`Failed to send fee reminder email: ${error.message}`);
  }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};

module.exports = exports;
