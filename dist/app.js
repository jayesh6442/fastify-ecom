import Fastify from 'fastify';
import dbPlugin from './plugins/db.js';
import jwtPlugin from './plugins/jwt.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import observabilityPlugin from './plugins/observability.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import cachePlugin from './plugins/cache.js';
import { productRoutes } from './modules/products/route.js';
import { orderRoutes, webhookRoutes } from './modules/orders/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import { inventoryRoutes } from './modules/inventory/routes.js';
import { cacheRoutes } from './modules/cache/routes.js';
export function buildApp() {
    const loggerConfig = {
        level: process.env.LOG_LEVEL || 'info'
    };
    if (process.env.NODE_ENV === 'development') {
        loggerConfig.transport = {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        };
    }
    const app = Fastify({ logger: loggerConfig });
    // Core plugins
    app.register(dbPlugin);
    app.register(jwtPlugin);
    app.register(cachePlugin);
    app.register(rateLimitPlugin);
    app.register(errorHandlerPlugin);
    app.register(observabilityPlugin);
    // Health check (before versioning)
    app.get('/health', async (req, reply) => {
        const result = await app.db.query('SELECT 1');
        return { status: 'ok', db: result.rowCount === 1 };
    });
    // API versioning - all routes under /v1
    app.register(async (app) => {
        app.register(authRoutes, { prefix: '/v1' });
        app.register(productRoutes, { prefix: '/v1' });
        app.register(orderRoutes, { prefix: '/v1' });
        app.register(userRoutes, { prefix: '/v1' });
        app.register(inventoryRoutes, { prefix: '/v1' });
        app.register(webhookRoutes, { prefix: '/v1' });
        app.register(cacheRoutes);
    });
    return app;
}
//# sourceMappingURL=app.js.map