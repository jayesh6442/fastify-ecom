import { getOrderById } from './query.js';
import { createPaymentIntent, confirmPaymentIntent } from '../../services/payment.js';
import { updateOrderStatus } from './query.js';
import { sendOrderPaidEmail } from '../../services/email.js';
export async function createPaymentHandler(request, reply) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
    const params = request.params;
    const orderId = Number(params.id);
    if (isNaN(orderId) || orderId <= 0) {
        return reply.code(400).send({ error: 'Invalid order ID' });
    }
    try {
        const user = request.user;
        // Get order
        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }
        if (order.status !== 'CREATED') {
            return reply.code(400).send({ error: 'Order cannot be paid in current state' });
        }
        // Create payment intent
        const paymentIntent = await createPaymentIntent(order.total_cents, orderId, {
            user_id: user.id.toString(),
            user_email: user.email,
        });
        return {
            payment_intent_id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
export async function confirmPaymentHandler(request, reply) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
    const params = request.params;
    const body = request.body;
    const orderId = Number(params.id);
    if (isNaN(orderId) || orderId <= 0) {
        return reply.code(400).send({ error: 'Invalid order ID' });
    }
    try {
        const user = request.user;
        // Get order
        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }
        // Confirm payment
        const confirmed = await confirmPaymentIntent(body.payment_intent_id);
        if (!confirmed) {
            return reply.code(400).send({ error: 'Payment not confirmed' });
        }
        // Update order status
        const result = await updateOrderStatus(request.server.db, orderId, 'PAID', 'CREATED');
        // Send email notification
        sendOrderPaidEmail(user.email, orderId).catch(err => {
            request.server.log.error({ err, orderId }, 'Failed to send payment email');
        });
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('cannot transition')) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
//# sourceMappingURL=payment-handlers.js.map