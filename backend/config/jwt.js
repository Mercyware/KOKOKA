const crypto = require('crypto');
const logger = require('../utils/logger');

// JWT configuration
const JWT_CONFIG = {
  // JWT secret key (generate a secure random one if not provided)
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  
  // JWT refresh token secret (different from the main secret)
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex'),
  
  // JWT expiration time
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1d',
  
  // JWT refresh token expiration time
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // JWT issuer
  JWT_ISSUER: process.env.JWT_ISSUER || 'school-management-system',
  
  // JWT audience
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'school-management-users',
  
  // JWT algorithm
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  
  // Cookie options
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'lax',
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000 // 1 day in milliseconds
};

// Log warning if using auto-generated secrets in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET not set in production environment. Using auto-generated secret.');
    logger.logSecurity('auto_generated_jwt_secret', { component: 'jwt' });
  }
  
  if (!process.env.JWT_REFRESH_SECRET) {
    logger.warn('JWT_REFRESH_SECRET not set in production environment. Using auto-generated secret.');
    logger.logSecurity('auto_generated_jwt_refresh_secret', { component: 'jwt' });
  }
}

// Generate a new JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Validate JWT configuration
const validateJwtConfig = () => {
  const issues = [];
  
  if (JWT_CONFIG.JWT_EXPIRE === '1d' && process.env.NODE_ENV === 'production') {
    issues.push('Using default JWT expiration time in production');
  }
  
  if (JWT_CONFIG.JWT_ALGORITHM !== 'HS256' && JWT_CONFIG.JWT_ALGORITHM !== 'RS256') {
    issues.push(`Unsupported JWT algorithm: ${JWT_CONFIG.JWT_ALGORITHM}`);
  }
  
  if (issues.length > 0) {
    logger.warn(`JWT configuration issues: ${issues.join(', ')}`);
    logger.logSecurity('jwt_config_issues', { issues, component: 'jwt' });
  }
  
  return issues.length === 0;
};

// Initialize JWT configuration
const initJwtConfig = () => {
  validateJwtConfig();
  
  logger.info('JWT configuration initialized');
  logger.logSystem('jwt_initialized', {
    algorithm: JWT_CONFIG.JWT_ALGORITHM,
    expire: JWT_CONFIG.JWT_EXPIRE,
    refreshExpire: JWT_CONFIG.JWT_REFRESH_EXPIRE
  });
  
  return JWT_CONFIG;
};

module.exports = {
  ...JWT_CONFIG,
  generateJwtSecret,
  validateJwtConfig,
  initJwtConfig
};
