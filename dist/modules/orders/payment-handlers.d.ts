import type { FastifyRequest, FastifyReply } from 'fastify';
export declare function createPaymentHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    razorpay_order_id: string;
    key_id: string;
    amount: number;
    currency: string;
    receipt: string;
}>;
export declare function confirmPaymentHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
/** Webhook: rawBody is the raw JSON string for signature verification. */
export declare function razorpayWebhookHandler(request: FastifyRequest<{
    Body: string;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=payment-handlers.d.ts.map