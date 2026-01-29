export declare const registerBody: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
        };
        password: {
            type: string;
            minLength: number;
        };
    };
};
export declare const registerAdminBody: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
        };
        password: {
            type: string;
            minLength: number;
        };
        admin_secret: {
            type: string;
        };
    };
};
export declare const loginBody: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
        };
        password: {
            type: string;
        };
    };
};
export declare const authResponse: {
    type: string;
    properties: {
        token: {
            type: string;
        };
        user: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                email: {
                    type: string;
                };
                role: {
                    type: string;
                };
            };
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map