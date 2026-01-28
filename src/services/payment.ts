import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
    apiVersion: '2025-12-15.clover',
});

export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
}

export async function createPaymentIntent(
    amountCents: number,
    orderId: number,
    metadata?: Record<string, string>
): Promise<PaymentIntent> {
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

export async function confirmPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    } catch (error) {
        return false;
    }
}

export async function cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
        await stripe.paymentIntents.cancel(paymentIntentId);
        return true;
    } catch (error) {
        return false;
    }
}
