export const createOrderBody = {
    type: 'object',
    required: ['user_id', 'product_id', 'quantity'],
    properties: {
        user_id: { type: 'number', minimum: 1 },
        product_id: { type: 'number', minimum: 1 },
        quantity: { type: 'number', minimum: 1 }
    }
};
//# sourceMappingURL=schemas.js.map