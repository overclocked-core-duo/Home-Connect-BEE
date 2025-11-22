const express = require('express');
const router = express.Router();
const {
    getAllKeys,
    getCacheStats,
    getKeyDetails,
    deleteCache,
    clearAllCache,
    getRedisClient
} = require('../db/redis');

/**
 * Get all cached keys
 * GET /api/redis/keys
 */
router.get('/keys', async (req, res) => {
    try {
        const pattern = req.query.pattern || '*'; // Show all keys by default
        const keys = await getAllKeys(pattern);

        // Get TTL for each key
        const client = getRedisClient();
        const keysWithTTL = await Promise.all(
            keys.map(async (key) => {
                const ttl = await client.ttl(key);
                return {
                    key,
                    ttl: ttl === -1 ? 'No expiration' : ttl === -2 ? 'Expired' : `${ttl}s`
                };
            })
        );

        res.json({
            success: true,
            count: keys.length,
            keys: keysWithTTL
        });
    } catch (err) {
        console.error('[Redis API] Error getting keys:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve cache keys',
            message: err.message
        });
    }
});

/**
 * Get cache statistics
 * GET /api/redis/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json({
            success: true,
            stats
        });
    } catch (err) {
        console.error('[Redis API] Error getting stats:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve cache statistics',
            message: err.message
        });
    }
});

/**
 * Get specific key details
 * GET /api/redis/key/:key
 */
router.get('/key/:key', async (req, res) => {
    try {
        const keyName = decodeURIComponent(req.params.key);
        const details = await getKeyDetails(keyName);

        if (!details) {
            return res.status(404).json({
                success: false,
                error: 'Key not found'
            });
        }

        res.json({
            success: true,
            details
        });
    } catch (err) {
        console.error('[Redis API] Error getting key details:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve key details',
            message: err.message
        });
    }
});

/**
 * Delete specific cached key
 * DELETE /api/redis/key/:key
 */
router.delete('/key/:key', async (req, res) => {
    try {
        const keyName = decodeURIComponent(req.params.key);
        await deleteCache(keyName);

        res.json({
            success: true,
            message: `Key '${keyName}' deleted successfully`
        });
    } catch (err) {
        console.error('[Redis API] Error deleting key:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete key',
            message: err.message
        });
    }
});

/**
 * Clear all cache
 * DELETE /api/redis/clear
 */
router.delete('/clear', async (req, res) => {
    try {
        await clearAllCache();

        res.json({
            success: true,
            message: 'All cache cleared successfully'
        });
    } catch (err) {
        console.error('[Redis API] Error clearing cache:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
            message: err.message
        });
    }
});

module.exports = router;
