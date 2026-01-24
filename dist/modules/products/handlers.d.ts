import type { FastifyRequest } from 'fastify';
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
}>): Promise<{
    id: number;
}>;
type CreateOrderRequest = FastifyRequest<{
    Body: {
        user_id: number;
        product_id: number;
        quantity: number;
    };
}>;
export declare function createOrderHandler(request: CreateOrderRequest): Promise<{
    order_id: number;
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map