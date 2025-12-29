/**
 * AWS SQS Queue Provider
 * 
 * Provides queue operations using AWS SQS
 */

const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } = require('@aws-sdk/client-sqs');

class SQSProvider {
  constructor(config) {
    this.config = config;
    this.client = new SQSClient({
      region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
      credentials: config.awsCredentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.connected = false;
  }

  async connect() {
    // SQS doesn't require explicit connection
    this.connected = true;
    return this;
  }

  async disconnect() {
    this.connected = false;
  }

  async sendMessage(queueUrl, message) {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: message.attributes || {},
    });

    const response = await this.client.send(command);
    return response.MessageId;
  }

  async receiveMessages(queueUrl, maxMessages = 1, waitTimeSeconds = 20) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: waitTimeSeconds,
      MessageAttributeNames: ['All'],
      AttributeNames: ['All'],
    });

    const response = await this.client.send(command);
    return response.Messages || [];
  }

  async deleteMessage(queueUrl, receiptHandle) {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
  }

  async getQueueAttributes(options) {
    const command = new GetQueueAttributesCommand({
      QueueUrl: options.queueUrl,
      AttributeNames: ['All'],
    });

    const response = await this.client.send(command);
    return response.Attributes;
  }
}

module.exports = SQSProvider;
