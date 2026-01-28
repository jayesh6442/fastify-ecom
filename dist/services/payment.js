import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
    apiVersion: '2025-12-15.clover',
});
export async function createPaymentIntent(amountCents, orderId, metadata) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        metadata: {
            order_id: orderId.toString(),
            ...metadata,
        },
    });
    return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
    };
}
export async function confirmPaymentIntent(paymentIntentId) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    }
    catch (error) {
        return false;
    }
}
export async function cancelPaymentIntent(paymentIntentId) {
    try {
        await stripe.paymentIntents.cancel(paymentIntentId);
        return true;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=payment.js.map