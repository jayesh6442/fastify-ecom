export const createOrderBody = {
    type: 'object',
    required: ['product_id', 'quantity'],
    properties: {
        product_id: { type: 'number', minimum: 1 },
        quantity: { type: 'number', minimum: 1 }
    }
};
//# sourceMappingURL=schemas.js.map