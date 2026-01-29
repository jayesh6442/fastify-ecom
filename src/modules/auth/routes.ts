import type { FastifyInstance } from 'fastify';
import { registerBody, loginBody, registerAdminBody, authResponse } from './schemas.js';
import { registerHandler, loginHandler, registerAdminHandler } from './handlers.js';

export async function authRoutes(app: FastifyInstance) {
    app.post(
        '/auth/register',
        {
            schema: {
                body: registerBody,
                response: {
                    200: authResponse,
                    409: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' }
                        }
                    }
                }
            }
        },
        registerHandler
    );

    app.post(
        '/auth/register-admin',
        {
            schema: {
                body: registerAdminBody,
                response: {
                    200: authResponse,
                    403: { type: 'object', properties: { error: { type: 'string' } } },
                    409: { type: 'object', properties: { error: { type: 'string' } } }
                }
            }
        },
        registerAdminHandler
    );

    app.post(
        '/auth/login',
        {
            schema: {
                body: loginBody,
                response: {
                    200: authResponse,
                    401: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' }
                        }
                    }
                }
            }
        },
        loginHandler
    );
}
