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
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    items: Array<{
        id: number;
        product_id: number;
        quantity: number;
        price_cents: number;
    }>;
}>;
export declare function getUserOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
}[]>;
export declare function getAllOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
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
export declare function updateOrderStatusHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    old_status: string;
    new_status: import("./query.js").ShippingStatus;
}>;
//# sourceMappingURL=handlers.d.ts.map