export declare const listProductsQuery: {
    type: string;
    properties: {
        limit: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
        };
        offset: {
            type: string;
            minimum: number;
            default: number;
        };
    };
};
export declare const productSchema: {
    type: string;
    properties: {
        id: {
            type: string;
        };
        name: {
            type: string;
        };
        price_cents: {
            type: string;
        };
        active: {
            type: string;
        };
        created_at: {
            type: string;
        };
    };
};
export declare const listProductsResponse: {
    type: string;
    items: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            name: {
                type: string;
            };
            price_cents: {
                type: string;
            };
            active: {
                type: string;
            };
            created_at: {
                type: string;
            };
        };
    };
};
export declare const createOrderBody: {
    type: string;
    required: string[];
    properties: {
        user_id: {
            type: string;
            minimum: number;
        };
        product_id: {
            type: string;
            minimum: number;
        };
        quantity: {
            type: string;
            minimum: number;
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map