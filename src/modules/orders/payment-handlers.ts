import type { FastifyRequest, FastifyReply } from 'fastify';
import { getOrderById, updateOrderStatus, setOrderRazorpayOrderId, getOrderByRazorpayOrderId } from './query.js';
import {
    createRazorpayOrder,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
    RAZORPAY_KEY_ID
} from '../../services/payment.js';
import { sendOrderPaidEmail } from '../../services/email.js';

export async function createPaymentHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const params = request.params as { id: string };
    const orderId = Number(params.id);

    if (isNaN(orderId) || orderId <= 0) {
        return reply.code(400).send({ error: 'Invalid order ID' });
    }

    try {
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };

        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }

        if (order.status !== 'CREATED') {
            return reply.code(400).send({ error: 'Order cannot be paid in current state' });
        }

        // Amount in paise (INR). We store total_cents; for India treat as paise.
        const amountPaise = order.total_cents;
        const razorpayOrder = await createRazorpayOrder(
            amountPaise,
            `order_${orderId}`,
            { order_id: String(orderId), user_id: String(user.id) }
        );

        if (!razorpayOrder) {
            return reply.code(503).send({ error: 'Payment provider not configured' });
        }

        await setOrderRazorpayOrderId(request.server.db, orderId, razorpayOrder.id);

        return {
            razorpay_order_id: razorpayOrder.id,
            key_id: RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt
        };
    } catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

export async function confirmPaymentHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const params = request.params as { id: string };
    const body = request.body as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    };
    const orderId = Number(params.id);

    if (isNaN(orderId) || orderId <= 0) {
        return reply.code(400).send({ error: 'Invalid order ID' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return reply.code(400).send({ error: 'Missing razorpay_order_id, razorpay_payment_id or razorpay_signature' });
    }

    try {
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };

        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }

        if (order.status !== 'CREATED') {
            return reply.code(400).send({ error: 'Order already processed' });
        }

        const valid = verifyRazorpayPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!valid) {
            return reply.code(400).send({ error: 'Invalid payment signature' });
        }

        const result = await updateOrderStatus(
            request.server.db,
            orderId,
            'PAID',
            'CREATED',
            { order_id: razorpay_order_id, payment_id: razorpay_payment_id }
        );

        sendOrderPaidEmail(user.email, orderId).catch(err => {
            request.server.log.error({ err, orderId }, 'Failed to send payment email');
        });

        return result;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('cannot transition')) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

/** Webhook: rawBody is the raw JSON string for signature verification. */
export async function razorpayWebhookHandler(
    request: FastifyRequest<{ Body: string }>,
    reply: FastifyReply
) {
    const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    const signature = request.headers['x-razorpay-signature'] as string | undefined;
    if (!signature) {
        return reply.code(400).send({ error: 'Missing x-razorpay-signature' });
    }
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
        return reply.code(400).send({ error: 'Invalid webhook signature' });
    }
    let payload: { event: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } }; order?: { entity?: { id?: string } } } };
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return reply.code(400).send({ error: 'Invalid JSON' });
    }
    if (payload.event !== 'payment.captured' && payload.event !== 'order.paid') {
        return reply.code(200).send({ ok: true });
    }
    const razorpayOrderId = payload.payload?.payment?.entity?.order_id ?? payload.payload?.order?.entity?.id;
    const razorpayPaymentId = payload.payload?.payment?.entity?.id;
    if (!razorpayOrderId || !razorpayPaymentId) {
        return reply.code(200).send({ ok: true });
    }
    try {
        const ourOrder = await getOrderByRazorpayOrderId(request.server.db, razorpayOrderId);
        if (!ourOrder || ourOrder.status !== 'CREATED') {
            return reply.code(200).send({ ok: true });
        }
        await updateOrderStatus(
            request.server.db,
            ourOrder.id,
            'PAID',
            'CREATED',
            { order_id: razorpayOrderId, payment_id: razorpayPaymentId }
        );
        request.server.log.info({ orderId: ourOrder.id, razorpayOrderId }, 'Order marked PAID via webhook');
    } catch (err) {
        request.server.log.error({ err, razorpayOrderId }, 'Webhook order update failed');
        return reply.code(500).send({ error: 'Webhook processing failed' });
    }
    return reply.code(200).send({ ok: true });
}
