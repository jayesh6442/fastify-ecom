/** Sign-up: register as USER, or as ADMIN if admin_secret is provided and valid. */
export declare const signUpBody: {
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
/** Sign-in: login with email and password. */
export declare const signInBody: {
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
/** Current user (from JWT). */
export declare const meResponse: {
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
//# sourceMappingURL=schemas.d.ts.map