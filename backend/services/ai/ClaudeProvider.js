const Anthropic = require('@anthropic-ai/sdk');
const AIProvider = require('./AIProvider');

/**
 * Claude (Anthropic) Provider
 */
class ClaudeProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'claude';

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout || 60000
    });
  }

  /**
   * Generate a chat completion
   */
  async chat(messages, options = {}) {
    try {
      // Extract system message if present
      const { systemMessage, userMessages } = this.extractSystemMessage(messages);

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        system: systemMessage,
        messages: this.formatMessages(userMessages),
        ...options
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error('Claude chat error:', error);
      throw new Error(`AI Provider Error: ${error.message}`);
    }
  }

  /**
   * Generate a single completion from a prompt
   */
  async complete(prompt, options = {}) {
    const messages = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }

  /**
   * Stream a chat completion
   */
  async *streamChat(messages, options = {}) {
    try {
      const { systemMessage, userMessages } = this.extractSystemMessage(messages);

      const stream = await this.client.messages.stream({
        model: this.config.model,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        system: systemMessage,
        messages: this.formatMessages(userMessages),
        ...options
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          yield {
            content: chunk.delta.text,
            finished: false
          };
        }
      }

      yield { finished: true };
    } catch (error) {
      console.error('Claude stream error:', error);
      throw new Error(`AI Provider Stream Error: ${error.message}`);
    }
  }

  /**
   * Extract system message from messages array
   * Claude requires system message to be separate from conversation
   */
  extractSystemMessage(messages) {
    const systemMessages = messages.filter(m => m.role.toLowerCase() === 'system');
    const userMessages = messages.filter(m => m.role.toLowerCase() !== 'system');

    const systemMessage = systemMessages.length > 0
      ? systemMessages.map(m => m.content).join('\n')
      : undefined;

    return { systemMessage, userMessages };
  }

  /**
   * Format messages to Claude format
   */
  formatMessages(messages) {
    return messages.map(msg => {
      const role = msg.role.toLowerCase();
      return {
        role: role === 'user' ? 'user' : 'assistant',
        content: msg.content
      };
    });
  }

  /**
   * Parse Claude response to standard format
   */
  parseResponse(response) {
    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    return {
      content,
      role: response.role,
      finishReason: response.stop_reason,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      provider: this.providerName
    };
  }

  /**
   * Get provider information
   */
  getInfo() {
    return {
      provider: this.providerName,
      model: this.config.model,
      configured: this.isConfigured(),
      apiUrl: this.config.apiUrl
    };
  }
}

module.exports = ClaudeProvider;
