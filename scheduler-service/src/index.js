/**
 * KOKOKA Scheduler Service - Main Entry Point
 * 
 * This service processes email jobs from the queue (AWS SQS or Redis)
 * and sends them using the configured email provider (SES, SendGrid, or SMTP)
 */

const { createQueueProvider } = require('./providers');
const EmailJobProcessor = require('./jobs/emailJob');
const config = require('./config');
const logger = require('./utils/logger');

class SchedulerService {
  constructor() {
    this.queueProvider = null;
    this.emailProcessor = null;
    this.running = false;
    this.priorityWorker = null;
    this.regularWorker = null;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      logger.info('🚀 Starting KOKOKA Scheduler Service...');
      logger.info(`Environment: ${config.env}`);
      logger.info(`Queue Provider: ${config.queue.provider}`);
      logger.info(`Email Provider: ${config.email.provider}`);

      // Initialize queue provider
      this.queueProvider = createQueueProvider(config.queue.provider, config.queue);
      await this.queueProvider.connect();
      logger.info('✅ Queue provider connected');

      // Initialize email processor
      this.emailProcessor = new EmailJobProcessor();
      await this.emailProcessor.initialize();
      logger.info('✅ Email processor initialized');

      logger.info('✅ Scheduler Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scheduler service:', error);
      throw error;
    }
  }

  /**
   * Process jobs from a queue
   * @param {string} queueUrl - Queue URL or name
   * @param {string} queueType - 'priority' or 'regular'
   */
  async processQueue(queueUrl, queueType = 'regular') {
    if (!queueUrl) {
      logger.warn(`${queueType} queue URL not configured, skipping...`);
      return;
    }

    logger.info(`📥 Starting ${queueType} queue worker for ${queueUrl}`);

    while (this.running) {
      try {
        // Poll for messages
        const messages = await this.queueProvider.receiveMessages(
          queueUrl,
          config.worker.maxMessages,
          config.worker.waitTimeSeconds
        );

        if (messages.length === 0) {
          continue; // No messages, continue polling
        }

        logger.info(`Received ${messages.length} message(s) from ${queueType} queue`);

        // Process each message
        for (const message of messages) {
          try {
            const job = {
              id: message.MessageId,
              body: JSON.parse(message.Body),
              receiptHandle: message.ReceiptHandle,
              approximateReceiveCount: message.Attributes?.ApproximateReceiveCount || 1,
            };

            // Process the email job
            await this.emailProcessor.process(job);

            // Delete message from queue on success
            await this.queueProvider.deleteMessage(queueUrl, message.ReceiptHandle);
            logger.info(`✅ Job ${job.id} completed and removed from queue`);
          } catch (error) {
            logger.error('Error processing message:', error);
            
            // Check retry count
            const receiveCount = parseInt(message.Attributes?.ApproximateReceiveCount || 1);
            if (receiveCount >= config.worker.maxRetries) {
              logger.error(`Job exceeded max retries (${config.worker.maxRetries}), moving to DLQ`);
              // Delete from queue (SQS will move to DLQ automatically if configured)
              await this.queueProvider.deleteMessage(queueUrl, message.ReceiptHandle);
            }
            // Otherwise, message will be retried after visibility timeout
          }
        }
      } catch (error) {
        logger.error(`Error polling ${queueType} queue:`, error);
        // Wait before retrying to avoid tight loop on persistent errors
        await new Promise(resolve => setTimeout(resolve, config.worker.pollInterval));
      }
    }

    logger.info(`${queueType} queue worker stopped`);
  }

  /**
   * Start the service
   */
  async start() {
    await this.initialize();
    this.running = true;

    // Start workers for both queues
    const workers = [];

    if (config.queue.priorityQueueUrl) {
      workers.push(this.processQueue(config.queue.priorityQueueUrl, 'priority'));
    }

    if (config.queue.regularQueueUrl) {
      workers.push(this.processQueue(config.queue.regularQueueUrl, 'regular'));
    }

    if (workers.length === 0) {
      throw new Error('No queue URLs configured. Please set SQS_PRIORITY_QUEUE_URL and/or SQS_REGULAR_QUEUE_URL');
    }

    logger.info(`✅ Scheduler Service running with ${workers.length} worker(s)`);

    // Wait for all workers (will run indefinitely)
    await Promise.all(workers);
  }

  /**
   * Stop the service gracefully
   */
  async stop() {
    logger.info('🛑 Stopping Scheduler Service...');
    this.running = false;

    if (this.queueProvider) {
      await this.queueProvider.disconnect();
    }

    logger.info('✅ Scheduler Service stopped');
  }
}

// Create and start service
const service = new SchedulerService();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal');
  await service.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  await service.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the service
service.start().catch((error) => {
  logger.error('Failed to start scheduler service:', error);
  process.exit(1);
});
