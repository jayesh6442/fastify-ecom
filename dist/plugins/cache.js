import fp from 'fastify-plugin';
import { Redis } from 'ioredis';
let redis = null;
const inMemoryCache = new Map();
async function cachePlugin(app) {
    // Try to connect to Redis, fallback to in-memory cache
    if (process.env.REDIS_URL) {
        try {
            redis = new Redis(process.env.REDIS_URL);
            app.log.info('Connected to Redis cache');
        }
        catch (error) {
            app.log.warn('Redis connection failed, using in-memory cache');
        }
    }
    else {
        app.log.info('Using in-memory cache (Redis not configured)');
    }
    app.decorate('cache', {
        async get(key) {
            if (redis) {
                try {
                    const value = await redis.get(key);
                    return value ? JSON.parse(value) : null;
                }
                catch {
                    return null;
                }
            }
            else {
                const cached = inMemoryCache.get(key);
                if (cached && cached.expires > Date.now()) {
                    return cached.value;
                }
                inMemoryCache.delete(key);
                return null;
            }
        },
        async set(key, value, ttlSeconds = 60) {
            if (redis) {
                try {
                    await redis.setex(key, ttlSeconds, JSON.stringify(value));
                }
                catch {
                    // Ignore Redis errors
                }
            }
            else {
                inMemoryCache.set(key, {
                    value,
                    expires: Date.now() + ttlSeconds * 1000,
                });
            }
        },
        async del(key) {
            if (redis) {
                try {
                    await redis.del(key);
                }
                catch {
                    // Ignore Redis errors
                }
            }
            else {
                inMemoryCache.delete(key);
            }
        },
    });
}
export default fp(cachePlugin);
//# sourceMappingURL=cache.js.map