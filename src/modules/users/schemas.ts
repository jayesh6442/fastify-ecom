export const createUserBody = {
    type: 'object',
    required: ['email'],
    properties: {
        email: { type: 'string', format: 'email' }
    }
};

export const userResponse = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        created_at: { type: 'string' }
    }
};
