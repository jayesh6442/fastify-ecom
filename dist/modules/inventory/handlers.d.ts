import type { FastifyRequest, FastifyReply } from 'fastify';
export declare function addInventoryHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    product_id: number;
    previous_quantity: number;
    added: number;
    new_quantity: number;
}>;
export declare function removeInventoryHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    product_id: number;
    previous_quantity: number;
    removed: number;
    new_quantity: number;
}>;
//# sourceMappingURL=handlers.d.ts.map