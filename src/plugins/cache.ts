import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';

let redis: Redis | null = null;
const inMemoryCache = new Map<string, { value: any; expires: number }>();

async function cachePlugin(app: FastifyInstance) {
    // Try to connect to Redis, fallback to in-memory cache
    if (process.env.REDIS_URL) {
        try {
            redis = new Redis(process.env.REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });

            // Test connection
            await redis.ping();
            app.log.info({ redisUrl: process.env.REDIS_URL }, '✅ Connected to Redis cache');
        } catch (error) {
            app.log.warn({ error, redisUrl: process.env.REDIS_URL }, '⚠️  Redis connection failed, using in-memory cache');
            redis = null; // Ensure redis is null on failure
        }
    } else {
        app.log.info('ℹ️  Using in-memory cache (Redis not configured - set REDIS_URL to use Redis)');
    }

    app.decorate('cache', {
        async get(key: string): Promise<any | null> {
            if (redis) {
                try {
                    const value = await redis.get(key);
                    if (value) {
                        app.log.debug({ key, source: 'Redis' }, 'Cache hit');
                        return JSON.parse(value);
                    }
                    app.log.debug({ key, source: 'Redis' }, 'Cache miss');
                    return null;
                } catch (err) {
                    app.log.warn({ err, key }, 'Redis get error, falling back to in-memory');
                    // Fallback to in-memory on Redis error
                    const cached = inMemoryCache.get(key);
                    if (cached && cached.expires > Date.now()) {
                        return cached.value;
                    }
                    if (cached) {
                        inMemoryCache.delete(key);
                    }
                    return null;
                }
            } else {
                // In-memory cache
                const cached = inMemoryCache.get(key);
                if (cached && cached.expires > Date.now()) {
                    app.log.debug({ key, source: 'In-memory' }, 'Cache hit');
                    return cached.value;
                }
                if (cached) {
                    inMemoryCache.delete(key);
                }
                app.log.debug({ key, source: 'In-memory' }, 'Cache miss');
                return null;
            }
        },

        async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
            if (redis) {
                try {
                    await redis.setex(key, ttlSeconds, JSON.stringify(value));
                    app.log.debug({ key, ttlSeconds, source: 'Redis' }, 'Cache set');
                } catch (err) {
                    app.log.warn({ err, key }, 'Redis set error, falling back to in-memory');
                    // Fallback to in-memory on Redis error
                    inMemoryCache.set(key, {
                        value,
                        expires: Date.now() + ttlSeconds * 1000,
                    });
                }
            } else {
                // In-memory cache
                inMemoryCache.set(key, {
                    value,
                    expires: Date.now() + ttlSeconds * 1000,
                });
                app.log.debug({ key, ttlSeconds, source: 'In-memory' }, 'Cache set');
            }
        },

        async del(key: string): Promise<void> {
            if (redis) {
                try {
                    await redis.del(key);
                    app.log.debug({ key, source: 'Redis' }, 'Cache delete');
                } catch (err) {
                    app.log.warn({ err, key }, 'Redis delete error, falling back to in-memory');
                    // Fallback to in-memory on Redis error
                    inMemoryCache.delete(key);
                }
            } else {
                // In-memory cache
                inMemoryCache.delete(key);
                app.log.debug({ key, source: 'In-memory' }, 'Cache delete');
            }
        },

        // Helper to get cache type
        getCacheType(): 'redis' | 'memory' {
            return redis ? 'redis' : 'memory';
        },
    });
}

export default fp(cachePlugin);
