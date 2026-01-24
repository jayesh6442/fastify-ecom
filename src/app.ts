// // src/app.ts
// import Fastify from 'fastify';

// export function buildApp() {
//     const app = Fastify({
//         logger: true,
//         disableRequestLogging: false,
//         requestTimeout: 30_000
//     });

//     app.get('/health', async () => {
//         return { status: 'ok' };
//     });

//     return app;
// }


import Fastify from 'fastify';
import { dbPlugin } from './plugins/db.js';
import { orderRoutes, productRoutes } from './modules/products/route.js';
import { userRoutes } from './modules/users/routes.js';

export function buildApp() {
    const app = Fastify({ logger: true });

    app.register(dbPlugin);
    app.register(productRoutes);
    app.register(orderRoutes);
    app.register(userRoutes)
    app.get('/health', async (req, reply) => {
        const result = await app.db.query('SELECT 1');
        return { status: 'ok', db: result.rowCount === 1 };
    });

    return app;
}
