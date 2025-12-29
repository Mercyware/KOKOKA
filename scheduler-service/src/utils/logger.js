/**
 * Simple Logger Utility
 * 
 * Provides consistent logging across the scheduler service
 */

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },

  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error);
  },

  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },

  debug: (message, meta = {}) => {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  },
};

module.exports = logger;
