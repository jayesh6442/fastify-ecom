import type { FastifyRequest } from 'fastify';
import { createProduct, listProducts } from './query.js';
import { createOrder } from '../orders/query.js';

type ListRequest = FastifyRequest<{
    Querystring: {
        limit?: number;
        offset?: number;
    };
}>;

export async function listProductsHandler(
    request: ListRequest
) {
    const { limit = 20, offset = 0 } = request.query;

    return listProducts(
        request.server.db,
        limit,
        offset
    );
}

export async function createProductHandler(
    request: FastifyRequest<{
        Body: {
            name: string;
            price_cents: number;
            initial_quantity: number;
        };
    }>
) {
    const { name, price_cents, initial_quantity } = request.body;

    return createProduct(
        request.server.db,
        name,
        price_cents,
        initial_quantity
    );


}



type CreateOrderRequest = FastifyRequest<{
    Body: {
        user_id: number;
        product_id: number;
        quantity: number;
    };
}>;

// export async function createOrderHandler(
//     request: CreateOrderRequest
// ) {
//     const { user_id, product_id, quantity } = request.body;

//     return createOrder(
//         request.server.db,
//         user_id,
//         product_id,
//         quantity
//     );
// }

export async function createOrderHandler(
    request: CreateOrderRequest
) {
    const key = request.headers['idempotency-key'];

    if (!key || typeof key !== 'string') {
        throw new Error('Missing Idempotency-Key');
    }

    const { user_id, product_id, quantity } = request.body;

    return createOrder(
        request.server.db,
        user_id,
        product_id,
        quantity,
        key
    );
}
