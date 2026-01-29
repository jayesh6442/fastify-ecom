export declare const RAZORPAY_KEY_ID: string;
export interface RazorpayOrderResult {
    id: string;
    amount: number;
    amount_paid: number;
    currency: string;
    receipt: string;
}
/** Create a Razorpay order. Amount in paise (INR). */
export declare function createRazorpayOrder(amountPaise: number, receipt: string, metadata?: Record<string, string>): Promise<RazorpayOrderResult | null>;
/**
 * Verify payment signature from client.
 * Client sends razorpay_order_id, razorpay_payment_id, razorpay_signature.
 */
export declare function verifyRazorpayPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean;
/**
 * Verify webhook signature. Use raw body string and x-razorpay-signature header.
 */
export declare function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean;
//# sourceMappingURL=payment.d.ts.map