/**
 * Configuration for Scheduler Service
 * 
 * Loads environment variables and provides configuration
 */

require('dotenv').config();

module.exports = {
  // Queue configuration
  queue: {
    provider: process.env.QUEUE_PROVIDER || 'aws-sqs',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    priorityQueueUrl: process.env.SQS_PRIORITY_QUEUE_URL,
    regularQueueUrl: process.env.SQS_REGULAR_QUEUE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Email configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@kokoka.com',
    fromName: process.env.EMAIL_FROM_NAME || 'KOKOKA School Management',

    // AWS SES
    ses: {
      host: process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: parseInt(process.env.SES_SMTP_PORT || '587'),
      user: process.env.SES_SMTP_USER,
      password: process.env.SES_SMTP_PASSWORD,
    },

    // SendGrid
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },

    // Generic SMTP
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },

  // Worker configuration
  worker: {
    pollInterval: parseInt(process.env.POLL_INTERVAL || '5000'), // ms
    maxMessages: parseInt(process.env.MAX_MESSAGES_PER_POLL || '10'),
    waitTimeSeconds: parseInt(process.env.WAIT_TIME_SECONDS || '20'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
};
