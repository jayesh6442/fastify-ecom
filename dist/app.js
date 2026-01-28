import Fastify from 'fastify';
import dbPlugin from './plugins/db.js';
import { productRoutes } from './modules/products/route.js';
import { orderRoutes } from './modules/orders/routes.js';
import { userRoutes } from './modules/users/routes.js';
export function buildApp() {
    const app = Fastify({ logger: true });
    app.register(dbPlugin);
    app.register(productRoutes);
    app.register(orderRoutes);
    app.register(userRoutes);
    app.get('/health', async (req, reply) => {
        const result = await app.db.query('SELECT 1');
        return { status: 'ok', db: result.rowCount === 1 };
    });
    return app;
}
//# sourceMappingURL=app.js.map