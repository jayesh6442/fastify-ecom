export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
}
export declare function createPaymentIntent(amountCents: number, orderId: number, metadata?: Record<string, string>): Promise<PaymentIntent>;
export declare function confirmPaymentIntent(paymentIntentId: string): Promise<boolean>;
export declare function cancelPaymentIntent(paymentIntentId: string): Promise<boolean>;
//# sourceMappingURL=payment.d.ts.map