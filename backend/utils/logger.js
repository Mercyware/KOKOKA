const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (more readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'school-management-system' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object for Morgan (HTTP request logger middleware)
logger.stream = {
  write: message => {
    logger.info(message.trim());
  }
};

// Log HTTP requests
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    // Log at different levels based on status code
    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });
  
  next();
};

// Log database operations
logger.logDatabase = (operation, collection, query, duration) => {
  logger.debug(`DB: ${operation} on ${collection} (${duration}ms)`, { query });
};

// Log authentication events
logger.logAuth = (event, user, success, ip) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, `AUTH: ${event}`, { 
    userId: user?.id || 'unknown', 
    email: user?.email || 'unknown',
    success, 
    ip 
  });
};

// Log errors with context
logger.logError = (error, context = {}) => {
  logger.error(`ERROR: ${error.message}`, {
    error,
    stack: error.stack,
    ...context
  });
};

// Log system events
logger.logSystem = (event, details = {}) => {
  logger.info(`SYSTEM: ${event}`, details);
};

// Log user activity
logger.logActivity = (userId, action, details = {}) => {
  logger.info(`ACTIVITY: User ${userId} - ${action}`, details);
};

// Log performance metrics
logger.logPerformance = (operation, duration, details = {}) => {
  logger.debug(`PERFORMANCE: ${operation} took ${duration}ms`, details);
};

// Log security events
logger.logSecurity = (event, details = {}, level = 'warn') => {
  logger.log(level, `SECURITY: ${event}`, details);
};

// Create a child logger with additional metadata
logger.child = metadata => {
  return logger.child(metadata);
};

// Gracefully close logger on application shutdown
process.on('exit', () => {
  logger.end();
});

module.exports = logger;
