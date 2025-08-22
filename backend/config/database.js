const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

// Prisma Client Configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Redis Configuration
const createRedisClient = () => {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Connection pool settings
    family: 4,
    keepAlive: true,
    connectionName: 'kokoka-backend',
  };

  // Support for Redis URL format (for Docker/Cloud deployments)
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      ...redisConfig,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });
  }

  return new Redis(redisConfig);
};

// Create Redis instances
const redisClient = createRedisClient();
const redisSubscriber = createRedisClient(); // For pub/sub if needed
const redisPublisher = createRedisClient();

// Redis Event Handlers
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('close', () => {
  console.log('🔌 Redis connection closed');
});

redisClient.on('reconnecting', (delay) => {
  console.log(`🔄 Redis reconnecting in ${delay}ms`);
});

// Prisma Event Handlers
prisma.$on('info', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Prisma Info:', e);
  }
});

prisma.$on('warn', (e) => {
  console.warn('⚠️ Prisma Warning:', e);
});

prisma.$on('error', (e) => {
  console.error('❌ Prisma Error:', e);
});

// Database connection test
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test Redis connection
    await redisClient.ping();
    console.log('✅ Connected to Redis cache');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

// Graceful shutdown
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from PostgreSQL');
    
    redisClient.disconnect();
    redisSubscriber.disconnect();
    redisPublisher.disconnect();
    console.log('🔌 Disconnected from Redis');
  } catch (error) {
    console.error('❌ Error during database shutdown:', error);
  }
};

// Cache helper functions
const cache = {
  // Get data from cache
  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  },

  // Set data in cache with optional TTL (in seconds)
  set: async (key, data, ttl = 3600) => {
    try {
      const serialized = JSON.stringify(data);
      if (ttl) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  },

  // Delete from cache
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  },

  // Delete multiple keys
  delPattern: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache DEL pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  },

  // Increment a value (useful for counters)
  incr: async (key, amount = 1) => {
    try {
      const result = await redisClient.incrby(key, amount);
      return result;
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error);
      return null;
    }
  },

  // Set with expiration
  expire: async (key, ttl) => {
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Cache EXPIRE error for key ${key}:`, error);
      return false;
    }
  }
};

// Session store configuration for express-session
const sessionStore = {
  getSessionStore: () => {
    const RedisStore = require('connect-redis').default;
    return new RedisStore({
      client: redisClient,
      prefix: 'kokoka:sess:',
      ttl: 60 * 60 * 24 * 7, // 7 days
    });
  }
};

// Health check function
const healthCheck = async () => {
  try {
    // Check Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    await redisClient.ping();
    
    return {
      database: 'connected',
      cache: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      database: error.message.includes('prisma') ? 'disconnected' : 'connected',
      cache: error.message.includes('redis') ? 'disconnected' : 'connected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  prisma,
  redisClient,
  redisSubscriber,
  redisPublisher,
  connectDatabase,
  disconnectDatabase,
  cache,
  sessionStore,
  healthCheck
};