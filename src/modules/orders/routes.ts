import type { FastifyInstance } from 'fastify';
import { createOrderBody } from './schemas.js';
import { createOrderHandler } from './handlers.js';

export async function orderRoutes(app: FastifyInstance) {
    app.post(
        '/orders',
        {
            schema: {
                body: createOrderBody
            }
        },
        createOrderHandler
    );
}
