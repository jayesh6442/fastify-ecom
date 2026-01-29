import type { FastifyRequest, FastifyReply } from 'fastify';
type SignUpRequest = FastifyRequest<{
    Body: {
        email: string;
        password: string;
        admin_secret?: string;
    };
}>;
type SignInRequest = FastifyRequest<{
    Body: {
        email: string;
        password: string;
    };
}>;
/**
 * Sign-up: register as USER, or as ADMIN if admin_secret is provided and valid.
 */
export declare function signUpHandler(request: SignUpRequest, reply: FastifyReply): Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        role: "USER" | "ADMIN";
    };
}>;
/**
 * Sign-in: login with email and password.
 */
export declare function signInHandler(request: SignInRequest, reply: FastifyReply): Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        role: "USER" | "ADMIN";
    };
}>;
/**
 * Current user from JWT (auth/me).
 */
export declare function meHandler(request: FastifyRequest, reply: FastifyReply): Promise<{
    id: number;
    email: string;
    role: string;
} | undefined>;
export {};
//# sourceMappingURL=handlers.d.ts.map