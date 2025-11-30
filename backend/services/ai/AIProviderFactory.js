const OpenAIProvider = require('./OpenAIProvider');
const ClaudeProvider = require('./ClaudeProvider');

/**
 * AI Provider Factory
 * Creates and manages AI provider instances based on configuration
 */
class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
  }

  /**
   * Initialize AI provider based on environment configuration
   * @returns {AIProvider} - Configured AI provider instance
   */
  static create() {
    const providerType = process.env.AI_PROVIDER || 'openai';

    switch (providerType.toLowerCase()) {
      case 'openai':
        return AIProviderFactory.createOpenAI();

      case 'azure-openai':
      case 'azure':
        return AIProviderFactory.createAzureOpenAI();

      case 'claude':
      case 'anthropic':
        return AIProviderFactory.createClaude();

      default:
        throw new Error(
          `Unknown AI provider: ${providerType}. Supported providers: openai, azure-openai, claude`
        );
    }
  }

  /**
   * Create OpenAI provider
   */
  static createOpenAI() {
    const config = {
      apiKey: process.env.OPENAI_API_KEY,
      apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      timeout: parseInt(process.env.OPENAI_TIMEOUT) || 60000
    };

    if (!config.apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }

    return new OpenAIProvider(config, false);
  }

  /**
   * Create Azure OpenAI provider
   */
  static createAzureOpenAI() {
    const config = {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      maxTokens: parseInt(process.env.AZURE_OPENAI_MAX_TOKENS) || 1000,
      temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE) || 0.7,
      timeout: parseInt(process.env.AZURE_OPENAI_TIMEOUT) || 60000
    };

    if (!config.apiKey || !config.endpoint || !config.deploymentName) {
      throw new Error(
        'AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME are required for Azure OpenAI provider'
      );
    }

    return new OpenAIProvider(config, true);
  }

  /**
   * Create Claude provider
   */
  static createClaude() {
    const config = {
      apiKey: process.env.CLAUDE_API_KEY,
      apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1',
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 1000,
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
      timeout: parseInt(process.env.CLAUDE_TIMEOUT) || 60000
    };

    if (!config.apiKey) {
      throw new Error('CLAUDE_API_KEY is required for Claude provider');
    }

    return new ClaudeProvider(config);
  }

  /**
   * Get or create singleton provider instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = this.create();
    }
    return this.instance;
  }

  /**
   * Reset singleton instance (useful for testing or switching providers)
   */
  static resetInstance() {
    this.instance = null;
  }

  /**
   * Check if AI is enabled and configured
   */
  static isEnabled() {
    const enabled = process.env.FEATURE_AI_ENABLED === 'true';
    if (!enabled) return false;

    try {
      const provider = this.getInstance();
      return provider.isConfigured();
    } catch (error) {
      console.error('AI Provider configuration error:', error.message);
      return false;
    }
  }

  /**
   * Get provider information
   */
  static getInfo() {
    try {
      const provider = this.getInstance();
      return provider.getInfo();
    } catch (error) {
      return {
        provider: 'none',
        configured: false,
        error: error.message
      };
    }
  }
}

module.exports = AIProviderFactory;
