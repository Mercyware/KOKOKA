/**
 * AI Configuration Service
 * Centralized configuration for all AI features
 */
class AIConfig {
  /**
   * Get current AI provider configuration
   */
  static getProviderConfig() {
    return {
      provider: process.env.AI_PROVIDER || 'openai',
      enabled: process.env.FEATURE_AI_ENABLED === 'true'
    };
  }

  /**
   * Get chatbot configuration
   */
  static getChatbotConfig() {
    return {
      enabled: process.env.AI_CHATBOT_ENABLED === 'true',
      systemPrompt:
        process.env.AI_CHATBOT_SYSTEM_PROMPT ||
        'You are a helpful school management assistant. Provide accurate, concise, and friendly responses to questions about school operations, academic policies, and general inquiries.',
      maxHistory: parseInt(process.env.AI_CHATBOT_MAX_HISTORY) || 10,
      fallbackToKB: process.env.AI_CHATBOT_FALLBACK_TO_KB !== 'false'
    };
  }

  /**
   * Get predictions configuration
   */
  static getPredictionsConfig() {
    return {
      enabled: process.env.AI_PREDICTIONS_ENABLED === 'true',
      confidenceThreshold: parseFloat(process.env.AI_PREDICTIONS_CONFIDENCE_THRESHOLD) || 0.7
    };
  }

  /**
   * Get attendance analysis configuration
   */
  static getAttendanceConfig() {
    return {
      enabled: process.env.AI_ATTENDANCE_PATTERNS_ENABLED === 'true',
      analysisWindowDays: parseInt(process.env.AI_ATTENDANCE_ANALYSIS_WINDOW_DAYS) || 30
    };
  }

  /**
   * Get smart notifications configuration
   */
  static getNotificationsConfig() {
    return {
      enabled: process.env.AI_SMART_NOTIFICATIONS_ENABLED === 'true',
      optimization: process.env.AI_NOTIFICATION_OPTIMIZATION === 'true'
    };
  }

  /**
   * Get rate limiting configuration
   */
  static getRateLimitConfig() {
    return {
      requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
      requestsPerDay: parseInt(process.env.AI_RATE_LIMIT_REQUESTS_PER_DAY) || 1000
    };
  }

  /**
   * Get caching configuration
   */
  static getCacheConfig() {
    return {
      enabled: process.env.AI_CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.AI_CACHE_TTL) || 3600
    };
  }

  /**
   * Get all AI configuration
   */
  static getAll() {
    return {
      provider: this.getProviderConfig(),
      chatbot: this.getChatbotConfig(),
      predictions: this.getPredictionsConfig(),
      attendance: this.getAttendanceConfig(),
      notifications: this.getNotificationsConfig(),
      rateLimit: this.getRateLimitConfig(),
      cache: this.getCacheConfig()
    };
  }

  /**
   * Validate configuration
   */
  static validate() {
    const errors = [];
    const provider = this.getProviderConfig();

    if (!provider.enabled) {
      return { valid: true, message: 'AI features are disabled' };
    }

    // Validate provider-specific configuration
    switch (provider.provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          errors.push('OPENAI_API_KEY is required for OpenAI provider');
        }
        break;

      case 'azure-openai':
      case 'azure':
        if (!process.env.AZURE_OPENAI_API_KEY) {
          errors.push('AZURE_OPENAI_API_KEY is required');
        }
        if (!process.env.AZURE_OPENAI_ENDPOINT) {
          errors.push('AZURE_OPENAI_ENDPOINT is required');
        }
        if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
          errors.push('AZURE_OPENAI_DEPLOYMENT_NAME is required');
        }
        break;

      case 'claude':
      case 'anthropic':
        if (!process.env.CLAUDE_API_KEY) {
          errors.push('CLAUDE_API_KEY is required for Claude provider');
        }
        break;

      default:
        errors.push(`Unknown AI provider: ${provider.provider}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = AIConfig;
