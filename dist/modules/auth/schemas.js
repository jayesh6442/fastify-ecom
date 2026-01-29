/** Sign-up: register as USER, or as ADMIN if admin_secret is provided and valid. */
export const signUpBody = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        admin_secret: { type: 'string' }
    }
};
/** Sign-in: login with email and password. */
export const signInBody = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' }
    }
};
export const authResponse = {
    type: 'object',
    properties: {
        token: { type: 'string' },
        user: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                role: { type: 'string' }
            }
        }
    }
};
/** Current user (from JWT). */
export const meResponse = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        role: { type: 'string' }
    }
};
//# sourceMappingURL=schemas.js.map