const redis = require('ioredis');

/**
 * Redis Connection Configuration
 * Used for caching and session management
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    redisClient = new redis(REDIS_URL);
    
    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
    
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
    
    // Test connection
    await redisClient.ping();
    
    return redisClient;
  } catch (err) {
    console.error('[Redis] Connection error:', err.message);
    throw err;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

/**
 * Set a key-value pair with optional TTL
 * @param {String} key - Cache key
 * @param {String} value - Cache value
 * @param {Number} ttl - Time to live in seconds (optional)
 */
const setCache = async (key, value, ttl = null) => {
  try {
    if (ttl) {
      await redisClient.setex(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (err) {
    console.error('[Redis] Set cache error:', err.message);
  }
};

/**
 * Get value by key
 * @param {String} key - Cache key
 */
const getCache = async (key) => {
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('[Redis] Get cache error:', err.message);
    return null;
  }
};

/**
 * Delete a key
 * @param {String} key - Cache key
 */
const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error('[Redis] Delete cache error:', err.message);
  }
};

/**
 * Clear all cache (use with caution)
 */
const clearAllCache = async () => {
  try {
    await redisClient.flushall();
    console.log('[Redis] All cache cleared');
  } catch (err) {
    console.error('[Redis] Clear cache error:', err.message);
  }
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('[Redis] Connection closed');
    }
  } catch (err) {
    console.error('[Redis] Error closing connection:', err.message);
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearAllCache,
  closeRedis
};
