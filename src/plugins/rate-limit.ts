import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

async function rateLimitPlugin(app: FastifyInstance) {
    const isTest = process.env.NODE_ENV === 'test';
    const globalMax = isTest ? 10000 : 100;
    const authMax = isTest ? 10000 : 10;
    const ordersMax = isTest ? 10000 : 20;

    await app.register(rateLimit, {
        max: globalMax,
        timeWindow: '1 minute',
        cache: 10000,
        allowList: ['127.0.0.1'],
        skipOnError: false,
    });

    app.register(rateLimit, {
        prefix: '/auth',
        max: authMax,
        timeWindow: '1 minute',
    });

    app.register(rateLimit, {
        prefix: '/orders',
        max: ordersMax,
        timeWindow: '1 minute',
    });
}

export default fp(rateLimitPlugin);
