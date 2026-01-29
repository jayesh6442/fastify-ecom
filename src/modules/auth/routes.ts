import type { FastifyInstance } from 'fastify';
import { signUpBody, signInBody, authResponse, meResponse } from './schemas.js';
import { signUpHandler, signInHandler, meHandler } from './handlers.js';

export async function authRoutes(app: FastifyInstance) {
    // Sign-up: register as USER, or ADMIN if admin_secret is valid
    app.post(
        '/auth/sign-up',
        {
            schema: {
                body: signUpBody,
                response: {
                    200: authResponse,
                    403: { type: 'object', properties: { error: { type: 'string' } } },
                    409: { type: 'object', properties: { error: { type: 'string' } } }
                }
            }
        },
        signUpHandler
    );

    // Sign-in: login with email and password
    app.post(
        '/auth/sign-in',
        {
            schema: {
                body: signInBody,
                response: {
                    200: authResponse,
                    401: { type: 'object', properties: { error: { type: 'string' } } }
                }
            }
        },
        signInHandler
    );

    // Current user from JWT
    app.get(
        '/auth/me',
        {
            schema: {
                response: {
                    200: meResponse,
                    401: { type: 'object', properties: { error: { type: 'string' } } }
                }
            }
        },
        meHandler
    );
}
