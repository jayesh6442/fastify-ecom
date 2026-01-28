import type { FastifyRequest, FastifyReply } from 'fastify';
import { createProduct, listProducts } from './query.js';

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
    }>,
    reply: FastifyReply
) {
    const { name, price_cents, initial_quantity } = request.body;

    try {
        return await createProduct(
            request.server.db,
            name,
            price_cents,
            initial_quantity
        );
    } catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
