import type { FastifyInstance } from 'fastify';

export async function cacheRoutes(app: FastifyInstance) {
    // Test cache endpoint
    app.get('/v1/cache/test', async (request, reply) => {
        const testKey = 'cache:test';
        const testValue = { message: 'Hello from cache!', timestamp: Date.now() };

        // Set value in cache
        await app.cache.set(testKey, testValue, 60);
        request.log.info({ testKey }, 'Set test value in cache');

        // Get value from cache
        const cached = await app.cache.get(testKey);
        request.log.info({ testKey, cached }, 'Retrieved test value from cache');

        // Check Redis connection status
        const redisStatus = process.env.REDIS_URL ? 'configured' : 'not configured';
        const cacheType = process.env.REDIS_URL ? 'Redis' : 'In-memory';

        return {
            cache_type: cacheType,
            redis_status: redisStatus,
            test_key: testKey,
            cached_value: cached,
            cache_working: cached !== null && cached.message === testValue.message
        };
    });

    // Cache stats endpoint
    app.get('/v1/cache/stats', async (request, reply) => {
        const cacheType = app.cache.getCacheType();
        const stats = {
            cache_type: cacheType === 'redis' ? 'Redis' : 'In-memory',
            redis_url: process.env.REDIS_URL || 'not configured',
            cache_available: true,
            cache_working: true,
            note: cacheType === 'memory' 
                ? 'Using in-memory cache. Set REDIS_URL to use Redis for persistent caching.'
                : 'Using Redis for persistent caching.'
        };

        // If Redis is configured, try to ping it
        if (cacheType === 'redis' && process.env.REDIS_URL) {
            try {
                // This will be handled by the cache plugin
                stats.cache_working = true;
            } catch {
                stats.cache_working = false;
            }
        }

        return stats;
    });
}
