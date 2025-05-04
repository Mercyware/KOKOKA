const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const startTime = Date.now();
    
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    const duration = Date.now() - startTime;
    logger.info(`MongoDB Connected: ${conn.connection.host} (${duration}ms)`);
    
    // Log system event
    logger.logSystem('database_connected', {
      host: conn.connection.host,
      name: conn.connection.name,
      duration
    });
    
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    
    // Log error with context
    logger.logError(error, { component: 'database', operation: 'connect' });
    
    // Exit process with failure
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
    
    // Log system event
    logger.logSystem('database_disconnected');
  } catch (error) {
    logger.error(`MongoDB Disconnection Error: ${error.message}`);
    
    // Log error with context
    logger.logError(error, { component: 'database', operation: 'disconnect' });
  }
};

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB connection disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

// Create MongoDB indexes
const createIndexes = async () => {
  try {
    // This will create all indexes defined in the models
    // It's automatically called when models are registered
    logger.info('MongoDB indexes created');
  } catch (error) {
    logger.error(`MongoDB Index Creation Error: ${error.message}`);
    logger.logError(error, { component: 'database', operation: 'createIndexes' });
  }
};

// Check database health
const checkDBHealth = async () => {
  try {
    const startTime = Date.now();
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    const duration = Date.now() - startTime;
    
    const isHealthy = result.ok === 1;
    
    logger.info(`MongoDB Health Check: ${isHealthy ? 'Healthy' : 'Unhealthy'} (${duration}ms)`);
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime: duration,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(`MongoDB Health Check Error: ${error.message}`);
    logger.logError(error, { component: 'database', operation: 'healthCheck' });
    
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    };
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  createIndexes,
  checkDBHealth
};
