import type { FastifyRequest, FastifyReply } from 'fastify';
export declare function createPaymentHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    payment_intent_id: string;
    client_secret: string;
    amount: number;
    currency: string;
}>;
export declare function confirmPaymentHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
//# sourceMappingURL=payment-handlers.d.ts.map