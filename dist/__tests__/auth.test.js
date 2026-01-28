import { buildApp } from '../app.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
describe('Auth', () => {
    let app;
    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });
    afterAll(async () => {
        await app.close();
    });
    it('should register a new user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/register',
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
        // First registration
        await app.inject({
            method: 'POST',
            url: '/v1/auth/register',
            payload: { email, password: 'test123456' },
        });
        // Second registration with same email
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/register',
            payload: { email, password: 'test123456' },
        });
        expect(response.statusCode).toBe(409);
    });
    it('should login with valid credentials', async () => {
        const email = `test-${Date.now()}@example.com`;
        const password = 'test123456';
        // Register
        await app.inject({
            method: 'POST',
            url: '/v1/auth/register',
            payload: { email, password },
        });
        // Login
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/login',
            payload: { email, password },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.token).toBeDefined();
    });
    it('should reject invalid credentials', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/login',
            payload: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
            },
        });
        expect(response.statusCode).toBe(401);
    });
});
//# sourceMappingURL=auth.test.js.map