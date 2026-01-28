import type { FastifyInstance } from 'fastify';
import { addInventoryBody, removeInventoryBody } from './schemas.js';
import { addInventoryHandler, removeInventoryHandler } from './handlers.js';
import { requireAdmin } from '../../utils/auth.js';

export async function inventoryRoutes(app: FastifyInstance) {
    app.post(
        '/inventory/:productId/add',
        {
            preHandler: [requireAdmin],
            schema: {
                params: {
                    type: 'object',
                    required: ['productId'],
                    properties: {
                        productId: { type: 'string' }
                    }
                },
                body: addInventoryBody
            }
        },
        addInventoryHandler
    );

    app.post(
        '/inventory/:productId/remove',
        {
            preHandler: [requireAdmin],
            schema: {
                params: {
                    type: 'object',
                    required: ['productId'],
                    properties: {
                        productId: { type: 'string' }
                    }
                },
                body: removeInventoryBody
            }
        },
        removeInventoryHandler
    );
}
