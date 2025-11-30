/**
 * AI Services Module
 * Provides unified access to all AI functionality
 */

const AIProviderFactory = require('./AIProviderFactory');
const AIConfig = require('./AIConfig');

/**
 * Get AI provider instance
 * @returns {AIProvider} - Configured AI provider
 */
function getAIProvider() {
  return AIProviderFactory.getInstance();
}

/**
 * Send a message to AI
 * @param {Array} messages - Conversation messages
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - AI response
 */
async function chat(messages, options = {}) {
  const provider = getAIProvider();
  return provider.chat(messages, options);
}

/**
 * Generate a completion from a prompt
 * @param {String} prompt - The prompt text
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - AI response
 */
async function complete(prompt, options = {}) {
  const provider = getAIProvider();
  return provider.complete(prompt, options);
}

/**
 * Stream a chat completion
 * @param {Array} messages - Conversation messages
 * @param {Object} options - Additional options
 * @returns {AsyncIterator} - Streaming response
 */
async function* streamChat(messages, options = {}) {
  const provider = getAIProvider();
  yield* provider.streamChat(messages, options);
}

/**
 * Check if AI is enabled and configured
 * @returns {Boolean}
 */
function isEnabled() {
  return AIProviderFactory.isEnabled();
}

/**
 * Get AI provider information
 * @returns {Object}
 */
function getInfo() {
  return AIProviderFactory.getInfo();
}

/**
 * Get AI configuration
 * @returns {Object}
 */
function getConfig() {
  return AIConfig.getAll();
}

/**
 * Validate AI configuration
 * @returns {Object}
 */
function validateConfig() {
  return AIConfig.validate();
}

module.exports = {
  // Provider management
  getAIProvider,
  AIProviderFactory,
  AIConfig,

  // Core AI functions
  chat,
  complete,
  streamChat,

  // Utility functions
  isEnabled,
  getInfo,
  getConfig,
  validateConfig
};
