import type { FastifyRequest, FastifyReply } from 'fastify';
import { createOrder } from './query.js';

type CreateOrderRequest = FastifyRequest<{
    Body: {
        user_id: number;
        product_id: number;
        quantity: number;
    };
    Headers: {
        'idempotency-key'?: string;
    };
}>;

export async function createOrderHandler(
    request: CreateOrderRequest,
    reply: FastifyReply
) {
    const key = request.headers['idempotency-key'];

    if (!key || typeof key !== 'string') {
        return reply.code(400).send({ error: 'Missing Idempotency-Key header' });
    }

    const { user_id, product_id, quantity } = request.body;

    try {
        return await createOrder(
            request.server.db,
            user_id,
            product_id,
            quantity,
            key
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Inventory not found' || error.message === 'Insufficient inventory') {
                return reply.code(400).send({ error: error.message });
            }
        }
        throw error;
    }
}
