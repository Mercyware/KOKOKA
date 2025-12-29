/**
 * Redis Queue Provider
 * 
 * Provides queue operations using Redis (Bull/BullMQ compatible)
 */

const Redis = require('ioredis');

class RedisProvider {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.connected = false;
  }

  async connect() {
    const redisUrl = this.config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    await new Promise((resolve) => {
      this.client.once('ready', resolve);
    });

    this.connected = true;
    return this;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  async sendMessage(queueName, message) {
    // Add to Redis list (simple queue implementation)
    const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      data: message,
      timestamp: Date.now(),
    };

    await this.client.rpush(queueName, JSON.stringify(messageData));
    return messageId;
  }

  async receiveMessages(queueName, maxMessages = 1, waitTimeSeconds = 20) {
    const messages = [];
    
    for (let i = 0; i < maxMessages; i++) {
      // BLPOP with timeout
      const result = await this.client.blpop(queueName, waitTimeSeconds);
      
      if (result) {
        const [, messageString] = result;
        const messageData = JSON.parse(messageString);
        
        messages.push({
          MessageId: messageData.id,
          Body: JSON.stringify(messageData.data),
          ReceiptHandle: messageData.id, // Use message ID as receipt handle
        });
      }
    }

    return messages;
  }

  async deleteMessage(queueName, receiptHandle) {
    // In this simple implementation, message is already removed by BLPOP
    // This method is kept for interface compatibility
    return true;
  }

  async getQueueAttributes(options) {
    const queueName = options.queueUrl || options.queueName;
    const length = await this.client.llen(queueName);
    
    return {
      ApproximateNumberOfMessages: length.toString(),
    };
  }
}

module.exports = RedisProvider;
