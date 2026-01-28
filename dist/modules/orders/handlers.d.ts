import type { FastifyRequest, FastifyReply } from 'fastify';
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
export declare function createOrderHandler(request: CreateOrderRequest, reply: FastifyReply): Promise<{
    order_id: number;
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map