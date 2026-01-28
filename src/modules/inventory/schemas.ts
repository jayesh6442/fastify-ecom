export const addInventoryBody = {
    type: 'object',
    required: ['quantity'],
    properties: {
        quantity: { type: 'number', minimum: 1 }
    }
};

export const removeInventoryBody = {
    type: 'object',
    required: ['quantity'],
    properties: {
        quantity: { type: 'number', minimum: 1 }
    }
};
