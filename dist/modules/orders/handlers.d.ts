import type { FastifyRequest, FastifyReply } from 'fastify';
export declare function createOrderHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    order_id: number;
}>;
export declare function getOrderByIdHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
}>;
export declare function getUserOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
}[]>;
export declare function getAllOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
}[]>;
export declare function payOrderHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
export declare function cancelOrderHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
//# sourceMappingURL=handlers.d.ts.map