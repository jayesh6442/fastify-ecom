import 'dotenv/config';
import { buildApp } from '../app.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('E2E', () => {
    let app: Awaited<ReturnType<typeof buildApp>>;
    let userToken: string;
    let adminToken: string;
    let userId: number;
    let productId: number;
    let orderId: number;
    const adminSecret = 'e2e-admin-secret';
    const userEmail = `e2e-user-${Date.now()}@example.com`;
    const adminEmail = `e2e-admin-${Date.now()}@example.com`;
    const password = 'password123';

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.ADMIN_REGISTRATION_SECRET = adminSecret;
        app = buildApp();
        await app.ready();
        const health = await app.inject({ method: 'GET', url: '/health' });
        const body = JSON.parse(health.body);
        if (!body.db) {
            throw new Error('E2E tests require PostgreSQL. Start DB and run: npm run build && npm run migrate');
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Health', () => {
        it('GET /health returns ok and db connected', async () => {
            const res = await app.inject({ method: 'GET', url: '/health' });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.status).toBe('ok');
            expect(body.db).toBe(true);
        });
    });

    describe('Auth', () => {
        it('POST /v1/auth/sign-up registers user', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/auth/sign-up',
                payload: { email: userEmail, password },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.token).toBeDefined();
            expect(body.user.role).toBe('USER');
            expect(body.user.email).toBe(userEmail);
            userId = body.user.id;
            userToken = body.token;
        });

        it('POST /v1/auth/sign-up with same email returns 409', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/auth/sign-up',
                payload: { email: userEmail, password },
            });
            expect(res.statusCode).toBe(409);
        });

        it('POST /v1/auth/sign-up with admin_secret registers admin', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/auth/sign-up',
                payload: { email: adminEmail, password, admin_secret: adminSecret },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('ADMIN');
            adminToken = body.token;
        });

        it('POST /v1/auth/sign-in with valid credentials returns token', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/auth/sign-in',
                payload: { email: userEmail, password },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.token).toBeDefined();
        });

        it('POST /v1/auth/sign-in with invalid credentials returns 401', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/auth/sign-in',
                payload: { email: userEmail, password: 'wrong' },
            });
            expect(res.statusCode).toBe(401);
        });

        it('GET /v1/auth/me with valid token returns user', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/v1/auth/me',
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.id).toBe(userId);
            expect(body.email).toBe(userEmail);
        });

        it('GET /v1/auth/me without token returns 401', async () => {
            const res = await app.inject({ method: 'GET', url: '/v1/auth/me' });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Products', () => {
        it('GET /v1/products returns list', async () => {
            const res = await app.inject({ method: 'GET', url: '/v1/products' });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(JSON.parse(res.body))).toBe(true);
        });

        it('POST /v1/products as admin creates product', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/products',
                headers: { authorization: `Bearer ${adminToken}` },
                payload: {
                    name: `E2E Product ${Date.now()}`,
                    price_cents: 1999,
                    initial_quantity: 10,
                },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.id).toBeDefined();
            productId = body.id;
        });

        it('POST /v1/products without auth returns 401', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/products',
                payload: { name: 'x', price_cents: 100, initial_quantity: 1 },
            });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Inventory', () => {
        it('POST /v1/inventory/:productId/add as admin adds stock', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/inventory/${productId}/add`,
                headers: { authorization: `Bearer ${adminToken}` },
                payload: { quantity: 5 },
            });
            expect(res.statusCode).toBe(200);
        });

        it('POST /v1/inventory/:productId/remove as admin removes stock', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/inventory/${productId}/remove`,
                headers: { authorization: `Bearer ${adminToken}` },
                payload: { quantity: 2 },
            });
            expect(res.statusCode).toBe(200);
        });

        it('POST /v1/inventory/:productId/add without auth returns 401', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/inventory/${productId}/add`,
                payload: { quantity: 1 },
            });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Orders', () => {
        it('POST /v1/orders without auth returns 401', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/v1/orders',
                payload: { product_id: productId, quantity: 1 },
                headers: { 'idempotency-key': `e2e-${Date.now()}` },
            });
            expect(res.statusCode).toBe(401);
        });

        it('POST /v1/orders as user creates order', async () => {
            const idem = `e2e-order-${Date.now()}`;
            const res = await app.inject({
                method: 'POST',
                url: '/v1/orders',
                headers: {
                    authorization: `Bearer ${userToken}`,
                    'idempotency-key': idem,
                },
                payload: {
                    product_id: productId,
                    quantity: 2,
                    shipping_address: '123 Test St',
                },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.order_id).toBeDefined();
            orderId = body.order_id;
        });

        it('GET /v1/orders/:id as owner returns order', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/v1/orders/${orderId}`,
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.id).toBe(orderId);
            expect(body.status).toBe('CREATED');
        });

        it('GET /v1/me/orders returns user orders', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/v1/me/orders',
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThanOrEqual(1);
        });

        it('POST /v1/orders/:id/cancel as owner cancels CREATED order', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/orders/${orderId}/cancel`,
                headers: { authorization: `Bearer ${userToken}` },
                payload: {},
            });
            expect([200, 400]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                const body = JSON.parse(res.body);
                expect(body.new_status).toBe('CANCELLED');
            }
        });
    });

    describe('Orders - second order for admin flow', () => {
        let paidOrderId: number;

        beforeAll(async () => {
            const idem = `e2e-paid-${Date.now()}`;
            const res = await app.inject({
                method: 'POST',
                url: '/v1/orders',
                headers: {
                    authorization: `Bearer ${userToken}`,
                    'idempotency-key': idem,
                },
                payload: { product_id: productId, quantity: 1 },
            });
            if (res.statusCode !== 200) throw new Error(`Create order failed: ${res.body}`);
            paidOrderId = JSON.parse(res.body).order_id;
        });

        it('POST /v1/orders/:id/pay marks order PAID (manual)', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/orders/${paidOrderId}/pay`,
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.new_status).toBe('PAID');
        });

        it('GET /v1/admin/orders as admin returns all orders', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/v1/admin/orders',
                headers: { authorization: `Bearer ${adminToken}` },
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(Array.isArray(body)).toBe(true);
        });

        it('PATCH /v1/admin/orders/:id/status as admin updates status', async () => {
            let res = await app.inject({
                method: 'PATCH',
                url: `/v1/admin/orders/${paidOrderId}/status`,
                headers: { authorization: `Bearer ${adminToken}` },
                payload: { status: 'PROCESSING' },
            });
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.body).new_status).toBe('PROCESSING');

            res = await app.inject({
                method: 'PATCH',
                url: `/v1/admin/orders/${paidOrderId}/status`,
                headers: { authorization: `Bearer ${adminToken}` },
                payload: { status: 'SHIPPED', tracking_number: 'TRK123' },
            });
            expect(res.statusCode).toBe(200);

            res = await app.inject({
                method: 'PATCH',
                url: `/v1/admin/orders/${paidOrderId}/status`,
                headers: { authorization: `Bearer ${adminToken}` },
                payload: { status: 'DELIVERED' },
            });
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.body).new_status).toBe('DELIVERED');
        });

        it('GET /v1/admin/orders as user returns 403', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/v1/admin/orders',
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect(res.statusCode).toBe(403);
        });
    });

    describe('Payment', () => {
        let paymentOrderId: number;

        beforeAll(async () => {
            const idem = `e2e-payment-${Date.now()}`;
            const res = await app.inject({
                method: 'POST',
                url: '/v1/orders',
                headers: {
                    authorization: `Bearer ${userToken}`,
                    'idempotency-key': idem,
                },
                payload: { product_id: productId, quantity: 1 },
            });
            paymentOrderId = JSON.parse(res.body).order_id;
        });

        it('POST /v1/orders/:id/payment returns razorpay data or 503', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/v1/orders/${paymentOrderId}/payment`,
                headers: { authorization: `Bearer ${userToken}` },
            });
            expect([200, 503]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                console.log("---------------------------------------");
                const body = JSON.parse(res.body);
                expect(body.razorpay_order_id).toBeDefined();
                expect(body.key_id).toBeDefined();
                expect(body.amount).toBeDefined();
            }
        });
    });

    describe('Cache', () => {
        it('GET /v1/cache/test returns cache status', async () => {
            const res = await app.inject({ method: 'GET', url: '/v1/cache/test' });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.cache_working).toBe(true);
            expect(body.cached_value).toBeDefined();
        });

        it('GET /v1/cache/stats returns cache type', async () => {
            const res = await app.inject({ method: 'GET', url: '/v1/cache/stats' });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.cache_type).toBeDefined();
            expect(body.cache_available).toBe(true);
        });
    });

    describe('Users', () => {
        it('GET /v1/users/:id returns user', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/v1/users/${userId}`,
            });
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.id).toBe(userId);
            expect(body.email).toBe(userEmail);
        });

        it('GET /v1/users/:id with invalid id returns 400 or 404', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/v1/users/999999',
            });
            expect(res.statusCode).toBe(404);
        });
    });
});
