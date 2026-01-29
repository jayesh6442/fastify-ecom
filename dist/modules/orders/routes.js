import { createOrderBody } from './schemas.js';
import { createOrderHandler, getOrderByIdHandler, getUserOrdersHandler, getAllOrdersHandler, payOrderHandler, cancelOrderHandler, updateOrderStatusHandler } from './handlers.js';
import { createPaymentHandler, confirmPaymentHandler, razorpayWebhookHandler } from './payment-handlers.js';
import { requireUser, requireAdmin } from '../../utils/auth.js';
export async function orderRoutes(app) {
    app.post('/orders', {
        preHandler: [requireUser],
        schema: {
            body: createOrderBody
        }
    }, createOrderHandler);
    app.get('/orders/:id', {
        preHandler: [requireUser],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, getOrderByIdHandler);
    app.get('/me/orders', {
        preHandler: [requireUser],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                    offset: { type: 'integer', minimum: 0, default: 0 }
                }
            }
        }
    }, getUserOrdersHandler);
    app.get('/admin/orders', {
        preHandler: [requireAdmin],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                    offset: { type: 'integer', minimum: 0, default: 0 }
                }
            }
        }
    }, getAllOrdersHandler);
    app.patch('/admin/orders/:id/status', {
        preHandler: [requireAdmin],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } }
            },
            body: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
                    tracking_number: { type: 'string' }
                }
            }
        }
    }, updateOrderStatusHandler);
    app.post('/orders/:id/pay', {
        preHandler: [requireUser],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, payOrderHandler);
    app.post('/orders/:id/cancel', {
        preHandler: [requireUser],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {}
            }
        }
    }, cancelOrderHandler);
    app.post('/orders/:id/payment', {
        preHandler: [requireUser],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, createPaymentHandler);
    app.post('/orders/:id/payment/confirm', {
        preHandler: [requireUser],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
                properties: {
                    razorpay_order_id: { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature: { type: 'string' }
                }
            }
        }
    }, confirmPaymentHandler);
}
/** Register webhook route with raw body parser (must be on same prefix as order routes). */
export async function webhookRoutes(app) {
    app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
        done(null, body);
    });
    app.post('/webhooks/razorpay', razorpayWebhookHandler);
}
//# sourceMappingURL=routes.js.map