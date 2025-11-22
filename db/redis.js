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
 * Get all keys matching a pattern
 * @param {String} pattern - Key pattern (default: *)
 */
const getAllKeys = async (pattern = '*') => {
  try {
    const client = getRedisClient();
    return await client.keys(pattern);
  } catch (err) {
    console.error('[Redis] Get all keys error:', err.message);
    return [];
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  try {
    const client = getRedisClient();
    const info = await client.info('stats');
    const dbSize = await client.dbsize();
    const memory = await client.info('memory');

    // Parse info string
    const parseInfo = (infoStr) => {
      const lines = infoStr.split('\r\n');
      const result = {};
      lines.forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key] = value;
          }
        }
      });
      return result;
    };

    const stats = parseInfo(info);
    const memStats = parseInfo(memory);

    return {
      totalKeys: dbSize,
      hits: parseInt(stats.keyspace_hits || 0),
      misses: parseInt(stats.keyspace_misses || 0),
      hitRate: stats.keyspace_hits && stats.keyspace_misses
        ? ((parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100).toFixed(2)
        : '0.00',
      memoryUsed: memStats.used_memory_human || 'N/A',
      memoryPeak: memStats.used_memory_peak_human || 'N/A'
    };
  } catch (err) {
    console.error('[Redis] Get cache stats error:', err.message);
    return {
      totalKeys: 0,
      hits: 0,
      misses: 0,
      hitRate: '0.00',
      memoryUsed: 'N/A',
      memoryPeak: 'N/A'
    };
  }
};

/**
 * Get key details including TTL and value
 * @param {String} key - Cache key
 */
const getKeyDetails = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    const ttl = await client.ttl(key);
    const type = await client.type(key);

    return {
      key,
      value,
      ttl: ttl === -1 ? 'No expiration' : ttl === -2 ? 'Key does not exist' : `${ttl}s`,
      type,
      size: value ? Buffer.byteLength(value, 'utf8') : 0
    };
  } catch (err) {
    console.error('[Redis] Get key details error:', err.message);
    return null;
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
  getAllKeys,
  getCacheStats,
  getKeyDetails,
  closeRedis
};

