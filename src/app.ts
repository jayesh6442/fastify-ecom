import Fastify from 'fastify';
import dbPlugin from './plugins/db.js';
import jwtPlugin from './plugins/jwt.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import observabilityPlugin from './plugins/observability.js';
import { productRoutes } from './modules/products/route.js';
import { orderRoutes } from './modules/orders/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import { inventoryRoutes } from './modules/inventory/routes.js';

export function buildApp() {
    const loggerConfig: any = {
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

    app.register(dbPlugin);
    app.register(jwtPlugin);
    app.register(errorHandlerPlugin);
    app.register(observabilityPlugin);
    app.register(authRoutes);
    app.register(productRoutes);
    app.register(orderRoutes);
    app.register(userRoutes);
    app.register(inventoryRoutes);
    app.get('/health', async (req, reply) => {
        const result = await app.db.query('SELECT 1');
        return { status: 'ok', db: result.rowCount === 1 };
    });

    return app;
}
