import type { FastifyInstance } from 'fastify';
import { createOrderBody } from './schemas.js';
import { createOrderHandler, getOrderByIdHandler, getUserOrdersHandler, getAllOrdersHandler, payOrderHandler, cancelOrderHandler } from './handlers.js';
import { createPaymentHandler, confirmPaymentHandler } from './payment-handlers.js';
import { requireUser, requireAdmin } from '../../utils/auth.js';

export async function orderRoutes(app: FastifyInstance) {
    app.post(
        '/orders',
        {
            preHandler: [requireUser],
            schema: {
                body: createOrderBody
            }
        },
        createOrderHandler
    );

    app.get(
        '/orders/:id',
        {
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
        },
        getOrderByIdHandler
    );

    app.get(
        '/me/orders',
        {
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
        },
        getUserOrdersHandler
    );

    app.get(
        '/admin/orders',
        {
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
        },
        getAllOrdersHandler
    );

    app.post(
        '/orders/:id/pay',
        {
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
        },
        payOrderHandler
    );

    app.post(
        '/orders/:id/cancel',
        {
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
        },
        cancelOrderHandler
    );

    app.post(
        '/orders/:id/payment',
        {
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
        },
        createPaymentHandler
    );

    app.post(
        '/orders/:id/payment/confirm',
        {
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
                    required: ['payment_intent_id'],
                    properties: {
                        payment_intent_id: { type: 'string' }
                    }
                }
            }
        },
        confirmPaymentHandler
    );
}
