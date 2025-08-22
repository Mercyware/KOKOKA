const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Connection settings
  connectTimeout: 10000,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  
  // Connection pool settings
  family: 4,
  keepAlive: true,
  connectionName: 'kokoka-api',
  
  // Cluster settings (if using Redis Cluster)
  enableOfflineQueue: false,
};

// Create Redis client with URL support (for Docker/Cloud)
const createRedisClient = (name = 'default') => {
  let client;
  
  if (process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
      ...redisConfig,
      connectionName: `kokoka-${name}`,
    });
  } else {
    client = new Redis({
      ...redisConfig,
      connectionName: `kokoka-${name}`,
    });
  }
  
  // Add event listeners
  client.on('connect', () => {
    console.log(`✅ Redis ${name} client connected`);
  });
  
  client.on('ready', () => {
    console.log(`🚀 Redis ${name} client ready`);
  });
  
  client.on('error', (err) => {
    console.error(`❌ Redis ${name} client error:`, err.message);
  });
  
  client.on('close', () => {
    console.log(`🔌 Redis ${name} client connection closed`);
  });
  
  client.on('reconnecting', (delay) => {
    console.log(`🔄 Redis ${name} client reconnecting in ${delay}ms`);
  });
  
  return client;
};

// Create multiple Redis clients for different purposes
const redis = {
  // Main client for general caching
  cache: createRedisClient('cache'),
  
  // Client for session storage
  session: createRedisClient('session'),
  
  // Client for pub/sub messaging
  publisher: createRedisClient('publisher'),
  subscriber: createRedisClient('subscriber'),
  
  // Client for background jobs/queues
  queue: createRedisClient('queue'),
};

// Cache utility functions
const cacheUtils = {
  // Generate cache keys
  keys: {
    user: (userId) => `user:${userId}`,
    school: (schoolId) => `school:${schoolId}`,
    student: (studentId) => `student:${studentId}`,
    teacher: (teacherId) => `teacher:${teacherId}`,
    class: (classId) => `class:${classId}`,
    grade: (studentId, assessmentId) => `grade:${studentId}:${assessmentId}`,
    attendance: (studentId, date) => `attendance:${studentId}:${date}`,
    assessment: (assessmentId) => `assessment:${assessmentId}`,
    stats: (schoolId, type) => `stats:${schoolId}:${type}`,
    session: (sessionId) => `sess:${sessionId}`,
  },
  
  // Cache with automatic JSON serialization
  set: async (key, data, ttl = 3600) => {
    try {
      const serialized = JSON.stringify(data);
      if (ttl > 0) {
        await redis.cache.setex(key, ttl, serialized);
      } else {
        await redis.cache.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  },
  
  // Get with automatic JSON parsing
  get: async (key) => {
    try {
      const data = await redis.cache.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  },
  
  // Delete single key
  del: async (key) => {
    try {
      const result = await redis.cache.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  },
  
  // Delete keys by pattern
  delPattern: async (pattern) => {
    try {
      const keys = await redis.cache.keys(pattern);
      if (keys.length > 0) {
        const result = await redis.cache.del(...keys);
        return result;
      }
      return 0;
    } catch (error) {
      console.error(`Cache DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  },
  
  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redis.cache.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  },
  
  // Increment counter
  incr: async (key, amount = 1) => {
    try {
      return await redis.cache.incrby(key, amount);
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error);
      return null;
    }
  },
  
  // Get or set pattern
  getOrSet: async (key, fetchFn, ttl = 3600) => {
    try {
      let data = await cacheUtils.get(key);
      
      if (data === null) {
        data = await fetchFn();
        if (data !== null && data !== undefined) {
          await cacheUtils.set(key, data, ttl);
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      // Return fresh data if cache fails
      try {
        return await fetchFn();
      } catch (fetchError) {
        console.error(`Fetch function error for key ${key}:`, fetchError);
        return null;
      }
    }
  },
};

// Pub/Sub utilities
const pubsub = {
  // Publish message to channel
  publish: async (channel, message) => {
    try {
      const serialized = typeof message === 'string' ? message : JSON.stringify(message);
      const result = await redis.publisher.publish(channel, serialized);
      return result; // Number of subscribers that received the message
    } catch (error) {
      console.error(`PubSub publish error for channel ${channel}:`, error);
      return 0;
    }
  },
  
  // Subscribe to channel
  subscribe: async (channel, callback) => {
    try {
      await redis.subscriber.subscribe(channel);
      
      redis.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsed = JSON.parse(message);
            callback(parsed);
          } catch (parseError) {
            // If JSON parsing fails, pass the raw message
            callback(message);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error(`PubSub subscribe error for channel ${channel}:`, error);
      return false;
    }
  },
  
  // Unsubscribe from channel
  unsubscribe: async (channel) => {
    try {
      await redis.subscriber.unsubscribe(channel);
      return true;
    } catch (error) {
      console.error(`PubSub unsubscribe error for channel ${channel}:`, error);
      return false;
    }
  },
};

// Background job utilities (simple implementation)
const jobs = {
  // Add job to queue
  add: async (queueName, jobData, options = {}) => {
    try {
      const jobId = `job:${queueName}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
      const job = {
        id: jobId,
        queue: queueName,
        data: jobData,
        createdAt: new Date().toISOString(),
        attempts: 0,
        maxAttempts: options.maxAttempts || 3,
        delay: options.delay || 0,
        priority: options.priority || 0,
      };
      
      // Add to queue with score for priority/delay
      const score = Date.now() + (options.delay || 0) - (options.priority || 0);
      await redis.queue.zadd(`queue:${queueName}`, score, JSON.stringify(job));
      
      return jobId;
    } catch (error) {
      console.error(`Job add error for queue ${queueName}:`, error);
      return null;
    }
  },
  
  // Process jobs from queue
  process: async (queueName, processor, concurrency = 1) => {
    const processJob = async () => {
      try {
        // Get next job
        const result = await redis.queue.zrange(`queue:${queueName}`, 0, 0, 'WITHSCORES');
        
        if (result.length === 0) {
          return; // No jobs available
        }
        
        const [jobData, score] = result;
        const job = JSON.parse(jobData);
        
        // Check if job should be processed now
        if (parseInt(score) > Date.now()) {
          return; // Job is delayed
        }
        
        // Remove job from queue
        await redis.queue.zrem(`queue:${queueName}`, jobData);
        
        // Process job
        try {
          await processor(job);
          console.log(`✅ Job ${job.id} completed successfully`);
        } catch (processingError) {
          console.error(`❌ Job ${job.id} failed:`, processingError);
          
          // Retry logic
          job.attempts++;
          if (job.attempts < job.maxAttempts) {
            const delay = Math.pow(2, job.attempts) * 1000; // Exponential backoff
            const retryScore = Date.now() + delay;
            await redis.queue.zadd(`queue:${queueName}`, retryScore, JSON.stringify(job));
            console.log(`🔄 Job ${job.id} will retry in ${delay}ms`);
          } else {
            // Move to dead letter queue
            await redis.queue.lpush(`queue:${queueName}:failed`, JSON.stringify(job));
            console.log(`💀 Job ${job.id} moved to dead letter queue`);
          }
        }
      } catch (error) {
        console.error(`Job processing error for queue ${queueName}:`, error);
      }
    };
    
    // Start processing with specified concurrency
    const interval = setInterval(() => {
      for (let i = 0; i < concurrency; i++) {
        processJob();
      }
    }, 1000);
    
    return () => clearInterval(interval); // Return cleanup function
  },
};

// Health check
const healthCheck = async () => {
  try {
    await redis.cache.ping();
    return { status: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'disconnected', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('🔌 Shutting down Redis connections...');
  
  try {
    await Promise.all([
      redis.cache.quit(),
      redis.session.quit(),
      redis.publisher.quit(),
      redis.subscriber.quit(),
      redis.queue.quit(),
    ]);
    console.log('✅ All Redis connections closed successfully');
  } catch (error) {
    console.error('❌ Error during Redis shutdown:', error);
  }
};

module.exports = {
  redis,
  cacheUtils,
  pubsub,
  jobs,
  healthCheck,
  shutdown,
};