import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;

export const RAZORPAY_KEY_ID = keyId;

export interface RazorpayOrderResult {
    id: string;
    amount: number;
    amount_paid: number;
    currency: string;
    receipt: string;
}

/** Razorpay order create params (SDK uses a union type; we use the standard order variant). */
interface RazorpayOrderCreateParams {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

/** Create a Razorpay order. Amount in paise (INR). */
export async function createRazorpayOrder(
    amountPaise: number,
    receipt: string,
    metadata?: Record<string, string>
): Promise<RazorpayOrderResult | null> {
    if (!razorpay) {
        return null;
    }
    const params: RazorpayOrderCreateParams = {
        amount: amountPaise,
        currency: 'INR',
        receipt,
        ...(metadata && { notes: metadata }),
    };
    const order = await (razorpay.orders.create(params as Parameters<Razorpay['orders']['create']>[0]) as Promise<{
        id: string;
        amount: number;
        amount_paid: number;
        currency: string;
        receipt?: string;
    }>);
    return {
        id: order.id,
        amount: order.amount,
        amount_paid: order.amount_paid ?? 0,
        currency: order.currency,
        receipt: order.receipt ?? receipt,
    };
}

/**
 * Verify payment signature from client.
 * Client sends razorpay_order_id, razorpay_payment_id, razorpay_signature.
 */
export function verifyRazorpayPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean {
    if (!keySecret) return false;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expected = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');
    return expected === razorpaySignature;
}

/**
 * Verify webhook signature. Use raw body string and x-razorpay-signature header.
 */
export function verifyRazorpayWebhookSignature(
    rawBody: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret) return false;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return expected === signature;
}
