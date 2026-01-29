import Razorpay from 'razorpay';
import crypto from 'crypto';
const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpay = keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;
export const RAZORPAY_KEY_ID = keyId;
/** Create a Razorpay order. Amount in paise (INR). */
export async function createRazorpayOrder(amountPaise, receipt, metadata) {
    if (!razorpay) {
        return null;
    }
    const params = {
        amount: amountPaise,
        currency: 'INR',
        receipt,
        ...(metadata && { notes: metadata }),
    };
    const order = await razorpay.orders.create(params);
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
export function verifyRazorpayPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    if (!keySecret)
        return false;
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
export function verifyRazorpayWebhookSignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret)
        return false;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return expected === signature;
}
//# sourceMappingURL=payment.js.map