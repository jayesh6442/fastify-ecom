export declare const createUserBody: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
        };
    };
};
export declare const userResponse: {
    type: string;
    properties: {
        id: {
            type: string;
        };
        email: {
            type: string;
        };
        created_at: {
            type: string;
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map