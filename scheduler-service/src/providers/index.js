/**
 * Queue Provider Factory
 * 
 * Creates queue provider instances based on configuration
 */

const SQSProvider = require('./sqsProvider');
const RedisProvider = require('./redisProvider');

/**
 * Create a queue provider based on provider type
 * @param {string} providerType - 'aws-sqs' or 'redis'
 * @param {object} config - Provider configuration
 * @returns {object} Queue provider instance
 */
function createQueueProvider(providerType, config) {
  switch (providerType) {
    case 'aws-sqs':
      return new SQSProvider(config);
    case 'redis':
      return new RedisProvider(config);
    default:
      throw new Error(`Unsupported queue provider: ${providerType}`);
  }
}

module.exports = {
  createQueueProvider,
  SQSProvider,
  RedisProvider
};
