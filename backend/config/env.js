const path = require('path');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Environment configuration
const ENV_CONFIG = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: parseInt(process.env.PORT || '5000'),
  HOST: process.env.HOST || 'localhost',
  API_URL: process.env.API_URL || 'http://localhost:5000/api',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_METHODS: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15 * 60 * 1000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
  
  // File upload limits
  FILE_UPLOAD_MAX_SIZE: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '5 * 1024 * 1024'), // 5MB
  FILE_UPLOAD_ALLOWED_TYPES: process.env.FILE_UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Security
  HELMET_ENABLED: process.env.HELMET_ENABLED !== 'false',
  XSS_PROTECTION_ENABLED: process.env.XSS_PROTECTION_ENABLED !== 'false',
  
  // Maintenance mode
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
  
  // Feature flags
  FEATURE_AI_ENABLED: process.env.FEATURE_AI_ENABLED !== 'false',
  FEATURE_SMS_ENABLED: process.env.FEATURE_SMS_ENABLED !== 'false',
  FEATURE_EMAIL_ENABLED: process.env.FEATURE_EMAIL_ENABLED !== 'false'
};

// Validate environment configuration
const validateEnvConfig = () => {
  const issues = [];
  
  // Check for required environment variables in production
  if (ENV_CONFIG.NODE_ENV === 'production') {
    const requiredVars = [
      'PORT',
      'API_URL',
      'FRONTEND_URL',
      'CORS_ORIGIN',
      'MONGO_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push(`Missing required environment variable in production: ${varName}`);
      }
    }
  }
  
  // Validate PORT is a valid number
  if (isNaN(ENV_CONFIG.PORT) || ENV_CONFIG.PORT <= 0 || ENV_CONFIG.PORT > 65535) {
    issues.push(`Invalid PORT: ${ENV_CONFIG.PORT}`);
  }
  
  // Validate URLs
  const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;
  if (!urlRegex.test(ENV_CONFIG.API_URL)) {
    issues.push(`Invalid API_URL: ${ENV_CONFIG.API_URL}`);
  }
  if (!urlRegex.test(ENV_CONFIG.FRONTEND_URL)) {
    issues.push(`Invalid FRONTEND_URL: ${ENV_CONFIG.FRONTEND_URL}`);
  }
  
  // Log issues
  if (issues.length > 0) {
    logger.warn(`Environment configuration issues: ${issues.join(', ')}`);
    logger.logSystem('env_config_issues', { issues });
  }
  
  return issues.length === 0;
};

// Get environment variable with fallback
const getEnv = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

// Check if environment is production
const isProduction = () => {
  return ENV_CONFIG.NODE_ENV === 'production';
};

// Check if environment is development
const isDevelopment = () => {
  return ENV_CONFIG.NODE_ENV === 'development';
};

// Check if environment is test
const isTest = () => {
  return ENV_CONFIG.NODE_ENV === 'test';
};

// Initialize environment configuration
const initEnvConfig = () => {
  validateEnvConfig();
  
  logger.info(`Environment: ${ENV_CONFIG.NODE_ENV}`);
  logger.info(`Server running on port ${ENV_CONFIG.PORT}`);
  
  logger.logSystem('env_initialized', {
    nodeEnv: ENV_CONFIG.NODE_ENV,
    port: ENV_CONFIG.PORT,
    apiUrl: ENV_CONFIG.API_URL,
    maintenanceMode: ENV_CONFIG.MAINTENANCE_MODE
  });
  
  return ENV_CONFIG;
};

module.exports = {
  ...ENV_CONFIG,
  validateEnvConfig,
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
  initEnvConfig
};
