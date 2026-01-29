import 'dotenv/config';
import { buildApp } from '../app.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('App', () => {
    let app: Awaited<ReturnType<typeof buildApp>>;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should respond to health check', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/health',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('ok');
    });

    it('should have v1 routes', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/products',
        });

        // Should not be 404 (route exists)
        expect(response.statusCode).not.toBe(404);
    });
});
