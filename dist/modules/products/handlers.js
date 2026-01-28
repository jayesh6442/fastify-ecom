import { createProduct, listProducts } from './query.js';
export async function listProductsHandler(request) {
    const { limit = 20, offset = 0 } = request.query;
    return listProducts(request.server.db, limit, offset);
}
export async function createProductHandler(request, reply) {
    const { name, price_cents, initial_quantity } = request.body;
    try {
        return await createProduct(request.server.db, name, price_cents, initial_quantity);
    }
    catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
//# sourceMappingURL=handlers.js.map