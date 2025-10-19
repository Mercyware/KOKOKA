/**
 * Email Configuration for Amazon SES
 *
 * This module provides configuration for sending emails via Amazon SES
 * using SMTP protocol with nodemailer.
 */

const config = {
  // Amazon SES SMTP Configuration
  smtp: {
    host: process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: parseInt(process.env.SES_SMTP_PORT || '587'),
    secure: process.env.SES_SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SES_SMTP_USER || '',
      pass: process.env.SES_SMTP_PASSWORD || '',
    },
  },

  // Email settings
  from: {
    default: process.env.EMAIL_FROM || 'KOKOKA School Management <noreply@kokoka.com>',
    noReply: process.env.EMAIL_NO_REPLY || 'noreply@kokoka.com',
    support: process.env.EMAIL_SUPPORT || 'support@kokoka.com',
  },

  // Feature flags
  enabled: process.env.EMAIL_ENABLED === 'true',

  // Email verification settings
  verification: {
    tokenExpiry: parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRE || '24'), // hours
    resendLimit: parseInt(process.env.EMAIL_VERIFICATION_RESEND_LIMIT || '3'), // max resends per day
  },

  // Application URLs for email links
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:8080',
    website: process.env.WEBSITE_URL || 'http://localhost:5173',
  },
};

// Validate required configuration
if (config.enabled) {
  if (!config.smtp.auth.user || !config.smtp.auth.pass) {
    console.warn('⚠️  Email is enabled but SES credentials are not configured');
  }
}

module.exports = config;
