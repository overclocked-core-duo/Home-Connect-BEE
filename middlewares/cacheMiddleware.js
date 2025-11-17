const { getRedisClient, getCache, setCache } = require('../db/redis');

/**
 * Redis caching middleware
 * Caches GET requests for specified duration
 * @param {Number} ttl - Time to live in seconds (default: 60)
 */
const cacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Check if Redis is connected
      let redis;
      try {
        redis = getRedisClient();
        await redis.ping(); // Test connection
      } catch (err) {
        // Redis not available, skip caching
        return next();
      }

      const key = `cache:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await getCache(key);

      if (cachedResponse) {
        console.log(`[Cache] HIT: ${req.originalUrl}`);
        return res.json(JSON.parse(cachedResponse));
      }

      console.log(`[Cache] MISS: ${req.originalUrl}`);

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        setCache(key, JSON.stringify(data), ttl).catch(err => {
          console.error('[Cache] Error setting cache:', err.message);
        });

        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('[Cache] Middleware error:', err.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
