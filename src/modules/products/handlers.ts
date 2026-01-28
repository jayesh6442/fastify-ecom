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

    // Create cache key
    const cacheKey = `products:list:${limit}:${offset}`;

    // Try to get from cache
    const cached = await request.server.cache.get(cacheKey);
    if (cached) {
        request.server.log.info({ cacheKey }, 'Cache hit for products list');
        return cached;
    }

    // Cache miss - fetch from database
    const products = await listProducts(
        request.server.db,
        limit,
        offset
    );

    // Store in cache for 60 seconds
    await request.server.cache.set(cacheKey, products, 60);
    request.server.log.info({ cacheKey }, 'Cache miss - stored products list');

    return products;
}

export async function createProductHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const body = request.body as { name: string; price_cents: number; initial_quantity: number };
    const { name, price_cents, initial_quantity } = body;

    try {
        const result = await createProduct(
            request.server.db,
            name,
            price_cents,
            initial_quantity
        );

        // Invalidate products list cache (clear common cache keys)
        // In production, you might want to use cache tags or pattern deletion
        const commonLimits = [10, 20, 50, 100];
        for (const limit of commonLimits) {
            await request.server.cache.del(`products:list:${limit}:0`);
        }
        request.server.log.info({ productId: result.id }, 'Invalidated products cache after creation');

        return result;
    } catch (error) {
        if (error instanceof Error) {
            // Check for duplicate product error
            if (error.message.includes('already exists') || error.message.includes('unique constraint')) {
                return reply.code(409).send({ error: 'Product with this name already exists' });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
