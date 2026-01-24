import type { FastifyInstance } from 'fastify';
import { createOrderBody, listProductsQuery, listProductsResponse } from './schemas.js';
import { createOrderHandler, createProductHandler, listProductsHandler } from './handlers.js';

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

