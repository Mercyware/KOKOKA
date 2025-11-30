const OpenAI = require('openai');
const AIProvider = require('./AIProvider');

/**
 * OpenAI Provider
 * Supports both standard OpenAI API and Azure OpenAI Service
 */
class OpenAIProvider extends AIProvider {
  constructor(config, isAzure = false) {
    super(config);
    this.providerName = isAzure ? 'azure-openai' : 'openai';
    this.isAzure = isAzure;

    this.client = this.initializeClient();
  }

  /**
   * Initialize OpenAI client
   */
  initializeClient() {
    if (this.isAzure) {
      // Azure OpenAI configuration
      return new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`,
        defaultQuery: { 'api-version': this.config.apiVersion },
        defaultHeaders: { 'api-key': this.config.apiKey },
        timeout: this.config.timeout || 60000
      });
    } else {
      // Standard OpenAI configuration
      return new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.apiUrl,
        timeout: this.config.timeout || 60000
      });
    }
  }

  /**
   * Generate a chat completion
   */
  async chat(messages, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        top_p: options.topP ?? 1,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
        ...options
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error(`${this.providerName} chat error:`, error);
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
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        stream: true,
        ...options
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield {
            content: delta.content,
            finished: false
          };
        }
      }

      yield { finished: true };
    } catch (error) {
      console.error(`${this.providerName} stream error:`, error);
      throw new Error(`AI Provider Stream Error: ${error.message}`);
    }
  }

  /**
   * Format messages to OpenAI format
   */
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));
  }

  /**
   * Parse OpenAI response to standard format
   */
  parseResponse(response) {
    const choice = response.choices[0];
    return {
      content: choice.message.content,
      role: choice.message.role,
      finishReason: choice.finish_reason,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      provider: this.providerName
    };
  }

  /**
   * Check if provider is configured
   */
  isConfigured() {
    if (this.isAzure) {
      return !!(
        this.config.apiKey &&
        this.config.endpoint &&
        this.config.deploymentName &&
        this.config.apiVersion
      );
    }
    return !!(this.config.apiKey);
  }

  /**
   * Get provider information
   */
  getInfo() {
    return {
      provider: this.providerName,
      model: this.config.model,
      configured: this.isConfigured(),
      isAzure: this.isAzure,
      endpoint: this.isAzure ? this.config.endpoint : this.config.apiUrl
    };
  }
}

module.exports = OpenAIProvider;
