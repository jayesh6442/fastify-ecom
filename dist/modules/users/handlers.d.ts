import type { FastifyRequest, FastifyReply } from "fastify";
type CreateUserRequest = FastifyRequest<{
    Body: {
        email: string;
    };
}>;
type GetUserRequest = FastifyRequest<{
    Params: {
        id: string;
    };
}>;
export declare function createUserHandler(request: CreateUserRequest): Promise<{
    id: number;
}>;
export declare function getUserHandler(request: GetUserRequest, reply: FastifyReply): Promise<{
    id: number;
    email: string;
    created_at: string;
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map