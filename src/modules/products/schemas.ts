export const listProductsQuery = {
    type: 'object',
    properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        offset: { type: 'integer', minimum: 0, default: 0 }
    }
};

export const productSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        price_cents: { type: 'number' },
        active: { type: 'boolean' },
        created_at: { type: 'string' }
    }
};

export const listProductsResponse = {
    type: 'array',
    items: productSchema
};
