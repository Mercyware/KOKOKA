/**
 * Base AI Provider Interface
 * Abstract class that all AI providers must implement
 */
class AIProvider {
  constructor(config) {
    if (this.constructor === AIProvider) {
      throw new Error('AIProvider is an abstract class and cannot be instantiated directly');
    }
    this.config = config;
    this.providerName = 'base';
  }

  /**
   * Generate a chat completion
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<Object>} - Response with content, tokens, model info
   */
  async chat(messages, options = {}) {
    throw new Error('chat() must be implemented by subclass');
  }

  /**
   * Generate a single completion from a prompt
   * @param {String} prompt - The prompt text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response with content
   */
  async complete(prompt, options = {}) {
    throw new Error('complete() must be implemented by subclass');
  }

  /**
   * Stream a chat completion
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @returns {AsyncIterator} - Async iterator for streaming responses
   */
  async *streamChat(messages, options = {}) {
    throw new Error('streamChat() must be implemented by subclass');
  }

  /**
   * Check if the provider is properly configured
   * @returns {Boolean}
   */
  isConfigured() {
    return !!this.config.apiKey;
  }

  /**
   * Get provider information
   * @returns {Object}
   */
  getInfo() {
    return {
      provider: this.providerName,
      model: this.config.model,
      configured: this.isConfigured()
    };
  }

  /**
   * Format messages to provider-specific format
   * @param {Array} messages - Standard message format
   * @returns {Array} - Provider-specific format
   */
  formatMessages(messages) {
    // Default implementation - override if needed
    return messages;
  }

  /**
   * Parse provider response to standard format
   * @param {Object} response - Provider-specific response
   * @returns {Object} - Standard response format
   */
  parseResponse(response) {
    throw new Error('parseResponse() must be implemented by subclass');
  }

  /**
   * Count tokens in text (approximate)
   * @param {String} text - Text to count tokens
   * @returns {Number} - Approximate token count
   */
  estimateTokens(text) {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

module.exports = AIProvider;
