export const registerBody = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 }
    }
};
export const registerAdminBody = {
    type: 'object',
    required: ['email', 'password', 'admin_secret'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        admin_secret: { type: 'string' }
    }
};
export const loginBody = {
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
//# sourceMappingURL=schemas.js.map