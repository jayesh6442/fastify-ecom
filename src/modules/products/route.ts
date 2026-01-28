import type { FastifyInstance } from 'fastify';
import { listProductsQuery, listProductsResponse } from './schemas.js';
import { createProductHandler, listProductsHandler } from './handlers.js';

export async function productRoutes(app: FastifyInstance) {
    app.get(
        '/products',
        {
            schema: {
                querystring: listProductsQuery,
                response: {
                    200: listProductsResponse
                }
            }
        },
        listProductsHandler
    );
    app.post(
        '/products',
        createProductHandler
    );
}

