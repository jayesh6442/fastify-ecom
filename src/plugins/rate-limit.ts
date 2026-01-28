import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

async function rateLimitPlugin(app: FastifyInstance) {
    await app.register(rateLimit, {
        max: 100, // Maximum number of requests
        timeWindow: '1 minute', // Time window
        cache: 10000, // Cache size
        allowList: ['127.0.0.1'], // Allow localhost
        skipOnError: false,
    });

    // Stricter rate limit for auth endpoints
    app.register(rateLimit, {
        prefix: '/auth',
        max: 10,
        timeWindow: '1 minute',
    });

    // Stricter rate limit for order creation
    app.register(rateLimit, {
        prefix: '/orders',
        max: 20,
        timeWindow: '1 minute',
    });
}

export default fp(rateLimitPlugin);
