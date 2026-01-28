import { registerBody, loginBody, authResponse } from './schemas.js';
import { registerHandler, loginHandler } from './handlers.js';
export async function authRoutes(app) {
    app.post('/auth/register', {
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
    }, registerHandler);
    app.post('/auth/login', {
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
    }, loginHandler);
}
//# sourceMappingURL=routes.js.map