/**
 * Email Queue
 *
 * Handles email sending via a Bull queue to decouple email operations
 * from the main request/response cycle and enable retries, scheduling, etc.
 */

const Queue = require('bull');
const logger = require('../utils/logger');

// Create email queue with Redis connection
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6380, // Default to 6380 for KOKOKA setup
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_EMAIL_QUEUE_DB) || 2, // Separate DB for email queue
  },
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Email job types
const EMAIL_JOBS = {
  SEND_EMAIL: 'send-email',
  SEND_WELCOME: 'send-welcome',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_VERIFICATION: 'send-verification',
  SEND_NOTIFICATION: 'send-notification',
  SEND_EXAM_RESULTS: 'send-exam-results',
  SEND_FEE_REMINDER: 'send-fee-reminder',
  SEND_BULK_EMAIL: 'send-bulk-email',
};

/**
 * Add email to queue
 * @param {string} type - Email job type
 * @param {Object} data - Email data
 * @param {Object} options - Job options (priority, delay, etc.)
 */
async function addEmailToQueue(type, data, options = {}) {
  try {
    const job = await emailQueue.add(type, data, {
      priority: options.priority || 5, // Default priority
      delay: options.delay || 0, // Delay in milliseconds
      ...options,
    });

    logger.info(`Email job added to queue: ${type}`, {
      jobId: job.id,
      type,
      recipient: data.to || data.email,
    });

    return job;
  } catch (error) {
    logger.error('Failed to add email to queue:', error);
    throw error;
  }
}

/**
 * Send a generic email
 */
async function queueEmail({ to, subject, text, html, from, cc, bcc, attachments, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_EMAIL, {
    to,
    subject,
    text,
    html,
    from,
    cc,
    bcc,
    attachments,
  }, { priority, delay });
}

/**
 * Send welcome email
 */
async function queueWelcomeEmail({ email, name, role, schoolName, subdomain, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_WELCOME, {
    email,
    name,
    role,
    schoolName,
    subdomain,
  }, { priority: priority || 3, delay }); // Higher priority for welcome emails
}

/**
 * Send password reset email
 */
async function queuePasswordResetEmail({ email, name, resetToken, resetUrl, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_PASSWORD_RESET, {
    email,
    name,
    resetToken,
    resetUrl,
  }, { priority: priority || 1, delay }); // Highest priority for password resets
}

/**
 * Send email verification
 */
async function queueVerificationEmail({ email, name, verificationToken, schoolName, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_VERIFICATION, {
    email,
    name,
    verificationToken,
    schoolName,
  }, { priority: priority || 2, delay }); // High priority for verification
}

/**
 * Send notification email
 */
async function queueNotificationEmail({ email, name, title, message, type, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_NOTIFICATION, {
    email,
    name,
    title,
    message,
    type,
  }, { priority: priority || 5, delay });
}

/**
 * Send exam results email
 */
async function queueExamResultsEmail({ email, name, exam, results, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_EXAM_RESULTS, {
    email,
    name,
    exam,
    results,
  }, { priority: priority || 4, delay });
}

/**
 * Send fee reminder email
 */
async function queueFeeReminderEmail({ email, name, feeDetails, priority, delay }) {
  return addEmailToQueue(EMAIL_JOBS.SEND_FEE_REMINDER, {
    email,
    name,
    feeDetails,
  }, { priority: priority || 6, delay });
}

/**
 * Send bulk emails (batch processing)
 */
async function queueBulkEmails(emails, options = {}) {
  const jobs = [];

  for (const emailData of emails) {
    const job = await addEmailToQueue(EMAIL_JOBS.SEND_BULK_EMAIL, emailData, {
      priority: options.priority || 7, // Lower priority for bulk emails
      delay: options.delay || 0,
    });
    jobs.push(job);
  }

  logger.info(`Bulk email jobs added to queue: ${jobs.length} emails`);
  return jobs;
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    logger.error('Failed to get queue stats:', error);
    return null;
  }
}

/**
 * Clean old completed and failed jobs
 */
async function cleanQueue(age = 24 * 3600 * 1000) {
  try {
    await emailQueue.clean(age, 'completed');
    await emailQueue.clean(age * 7, 'failed'); // Keep failed jobs longer
    logger.info('Email queue cleaned');
  } catch (error) {
    logger.error('Failed to clean queue:', error);
  }
}

/**
 * Pause queue processing
 */
async function pauseQueue() {
  await emailQueue.pause();
  logger.info('Email queue paused');
}

/**
 * Resume queue processing
 */
async function resumeQueue() {
  await emailQueue.resume();
  logger.info('Email queue resumed');
}

/**
 * Close queue connection
 */
async function closeQueue() {
  await emailQueue.close();
  logger.info('Email queue closed');
}

// Event listeners for monitoring
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job completed: ${job.id}`, {
    type: job.name,
    recipient: job.data.to || job.data.email,
  });
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job failed: ${job.id}`, {
    type: job.name,
    recipient: job.data.to || job.data.email,
    error: err.message,
    attempts: job.attemptsMade,
  });
});

emailQueue.on('stalled', (job) => {
  logger.warn(`Email job stalled: ${job.id}`, {
    type: job.name,
  });
});

emailQueue.on('error', (error) => {
  logger.error('Email queue error:', error);
});

module.exports = {
  emailQueue,
  EMAIL_JOBS,
  queueEmail,
  queueWelcomeEmail,
  queuePasswordResetEmail,
  queueVerificationEmail,
  queueNotificationEmail,
  queueExamResultsEmail,
  queueFeeReminderEmail,
  queueBulkEmails,
  getQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  closeQueue,
};
