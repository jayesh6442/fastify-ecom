import 'dotenv/config';
import { buildApp } from '../app.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Auth', () => {
    let app: Awaited<ReturnType<typeof buildApp>>;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = buildApp();
        await app.ready();
        const health = await app.inject({ method: 'GET', url: '/health' });
        const body = JSON.parse(health.body);
        if (!body.db) {
            throw new Error('Auth tests require PostgreSQL. Start DB and run: npm run build && npm run migrate');
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it('should sign up a new user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-up',
            payload: {
                email: `test-${Date.now()}@example.com`,
                password: 'test123456',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.token).toBeDefined();
        expect(body.user).toBeDefined();
        expect(body.user.role).toBe('USER');
    });

    it('should reject duplicate email', async () => {
        const email = `test-${Date.now()}@example.com`;

        await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-up',
            payload: { email, password: 'test123456' },
        });

        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-up',
            payload: { email, password: 'test123456' },
        });

        expect(response.statusCode).toBe(409);
    });

    it('should sign in with valid credentials', async () => {
        const email = `test-${Date.now()}@example.com`;
        const password = 'test123456';

        await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-up',
            payload: { email, password },
        });

        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-in',
            payload: { email, password },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/sign-in',
            payload: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
            },
        });

        expect(response.statusCode).toBe(401);
    });
});
