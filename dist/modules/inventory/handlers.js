import { addInventory, removeInventory } from './queries.js';
export async function addInventoryHandler(request, reply) {
    const params = request.params;
    const body = request.body;
    const productId = Number(params.productId);
    const { quantity } = body;
    if (isNaN(productId) || productId <= 0) {
        return reply.code(400).send({ error: 'Invalid product ID' });
    }
    try {
        return await addInventory(request.server.db, productId, quantity);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Inventory not found') {
                return reply.code(404).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
export async function removeInventoryHandler(request, reply) {
    const params = request.params;
    const body = request.body;
    const productId = Number(params.productId);
    const { quantity } = body;
    if (isNaN(productId) || productId <= 0) {
        return reply.code(400).send({ error: 'Invalid product ID' });
    }
    try {
        return await removeInventory(request.server.db, productId, quantity);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Inventory not found') {
                return reply.code(404).send({ error: error.message });
            }
            if (error.message === 'Insufficient inventory') {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
//# sourceMappingURL=handlers.js.map