import type { FastifyRequest, FastifyReply } from 'fastify';
type RegisterRequest = FastifyRequest<{
    Body: {
        email: string;
        password: string;
    };
}>;
type LoginRequest = FastifyRequest<{
    Body: {
        email: string;
        password: string;
    };
}>;
type RegisterAdminRequest = FastifyRequest<{
    Body: {
        email: string;
        password: string;
        admin_secret: string;
    };
}>;
export declare function registerHandler(request: RegisterRequest, reply: FastifyReply): Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        role: "USER";
    };
}>;
export declare function registerAdminHandler(request: RegisterAdminRequest, reply: FastifyReply): Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        role: "ADMIN";
    };
}>;
export declare function loginHandler(request: LoginRequest, reply: FastifyReply): Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        role: "USER" | "ADMIN";
    };
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map