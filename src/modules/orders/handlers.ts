import type { FastifyRequest, FastifyReply } from 'fastify';
import { createOrder, getOrderById, getUserOrders, getAllOrders, updateOrderStatus, restoreInventoryForOrder, getOrderItems } from './query.js';
import { sendOrderConfirmationEmail, sendOrderPaidEmail, sendOrderCancelledEmail } from '../../services/email.js';

export async function createOrderHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const key = request.headers['idempotency-key'];

    if (!key || typeof key !== 'string') {
        return reply.code(400).send({ error: 'Missing Idempotency-Key header' });
    }

    const body = request.body as { product_id: number; quantity: number };
    const { product_id, quantity } = body;
    const user_id = (request.user as { id: number; email: string; role: 'USER' | 'ADMIN' }).id;

    try {
        const result = await createOrder(
            request.server.db,
            user_id,
            product_id,
            quantity,
            key
        );

        // Send order confirmation email
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };
        const order = await getOrderById(request.server.db, result.order_id, user_id);
        if (order) {
            sendOrderConfirmationEmail(user.email, result.order_id, order.total_cents).catch(err => {
                request.server.log.error({ err, orderId: result.order_id }, 'Failed to send order confirmation email');
            });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Inventory not found' || error.message === 'Insufficient inventory') {
                return reply.code(400).send({ error: error.message });
            }
        }
        throw error;
    }
}

export async function getOrderByIdHandler(
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
        // Users can only see their own orders, admins can see any
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };
        const userId = user.role === 'ADMIN' ? undefined : user.id;
        const order = await getOrderById(request.server.db, orderId, userId);

        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }

        return order;
    } catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

export async function getUserOrdersHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const query = request.query as { limit?: number; offset?: number };
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;

    try {
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };
        const orders = await getUserOrders(request.server.db, user.id, limit, offset);
        return orders;
    } catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

export async function getAllOrdersHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' } | undefined;
    if (!user || user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }

    const query = request.query as { limit?: number; offset?: number };
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;

    try {
        const orders = await getAllOrders(request.server.db, limit, offset);
        return orders;
    } catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

export async function payOrderHandler(
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
        
        // Get order first to check ownership
        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }

        const result = await updateOrderStatus(request.server.db, orderId, 'PAID', 'CREATED');
        
        // Send email notification
        if (order) {
            sendOrderPaidEmail(user.email, orderId).catch(err => {
                request.server.log.error({ err, orderId }, 'Failed to send payment email');
            });
        }
        
        return result;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Order not found') {
                return reply.code(404).send({ error: error.message });
            }
            if (error.message.includes('cannot transition')) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}

export async function cancelOrderHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const params = request.params as { id: string };
    const body = request.body as { product_id?: number; quantity?: number };
    const orderId = Number(params.id);

    if (isNaN(orderId) || orderId <= 0) {
        return reply.code(400).send({ error: 'Invalid order ID' });
    }

    try {
        const user = request.user as { id: number; email: string; role: 'USER' | 'ADMIN' };
        
        // Get order first to check ownership
        const order = await getOrderById(request.server.db, orderId, user.role === 'ADMIN' ? undefined : user.id);
        if (!order) {
            return reply.code(404).send({ error: 'Order not found' });
        }

        // Update order status
        const result = await updateOrderStatus(request.server.db, orderId, 'CANCELLED', 'CREATED');

        // Restore inventory from order_items
        await restoreInventoryForOrder(request.server.db, orderId);

        // Send email notification
        if (order) {
            sendOrderCancelledEmail(user.email, orderId).catch(err => {
                request.server.log.error({ err, orderId }, 'Failed to send cancellation email');
            });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Order not found' || error.message === 'Inventory not found') {
                return reply.code(404).send({ error: error.message });
            }
            if (error.message.includes('cannot transition')) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
