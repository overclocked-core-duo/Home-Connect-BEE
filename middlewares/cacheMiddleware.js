const { getCache, setCache } = require('../db/redis');

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
      // Generate cache key from URL and query parameters
      const cacheKey = `cache:${req.originalUrl || req.url}`;

      // Try to get cached response
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`[Cache] Cache HIT for ${cacheKey}`);
        // Parse and send cached response
        return res.json(JSON.parse(cachedData));
      }

      console.log(`[Cache] Cache MISS for ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response data
        setCache(cacheKey, JSON.stringify(data), ttl)
          .then(() => {
            console.log(`[Cache] Cached response for ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch(err => {
            console.error('[Cache] Error caching response:', err.message);
          });

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('[Cache] Middleware error:', err.message);
      // Continue without caching on error
      next();
    }
  };
};

module.exports = cacheMiddleware;
