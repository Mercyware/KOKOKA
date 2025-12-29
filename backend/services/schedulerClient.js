/**
 * Scheduler Client Singleton
 * 
 * Provides a singleton instance of the SchedulerClient for backend services
 */

const SchedulerClient = require('../../scheduler-service/src/client');
const logger = require('../utils/logger');

// Create singleton instance
const schedulerClient = new SchedulerClient({
  provider: process.env.QUEUE_PROVIDER || 'aws-sqs',
  regularQueueUrl: process.env.SQS_REGULAR_QUEUE_URL,
  priorityQueueUrl: process.env.SQS_PRIORITY_QUEUE_URL,
});

// Connect on startup
let connectionPromise = null;

const ensureConnected = async () => {
  if (!connectionPromise) {
    connectionPromise = schedulerClient.connect()
      .then(() => {
        logger.info('✅ Scheduler client connected');
      })
      .catch(error => {
        logger.error('❌ Failed to connect scheduler client:', error);
        connectionPromise = null; // Reset on failure to allow retry
        throw error;
      });
  }
  return connectionPromise;
};

// Auto-connect in background (don't block startup)
ensureConnected().catch(error => {
  logger.error('Initial scheduler client connection failed:', error);
});

// Export wrapped methods that ensure connection
module.exports = {
  async sendEmail(options) {
    await ensureConnected();
    return schedulerClient.sendEmail(options);
  },

  async scheduleEmail(options) {
    await ensureConnected();
    return schedulerClient.scheduleEmail(options);
  },

  async cancelJob(jobId) {
    await ensureConnected();
    return schedulerClient.cancelJob(jobId);
  },

  async healthcheck() {
    await ensureConnected();
    return schedulerClient.healthcheck();
  },

  async disconnect() {
    return schedulerClient.disconnect();
  },

  // Expose raw client for advanced usage
  getClient() {
    return schedulerClient;
  }
};
