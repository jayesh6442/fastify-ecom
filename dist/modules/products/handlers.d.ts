import type { FastifyRequest, FastifyReply } from 'fastify';
type ListRequest = FastifyRequest<{
    Querystring: {
        limit?: number;
        offset?: number;
    };
}>;
export declare function listProductsHandler(request: ListRequest): Promise<any[]>;
export declare function createProductHandler(request: FastifyRequest<{
    Body: {
        name: string;
        price_cents: number;
        initial_quantity: number;
    };
}>, reply: FastifyReply): Promise<{
    id: number;
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map