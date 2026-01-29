import type { FastifyRequest, FastifyReply } from "fastify";
type GetUserRequest = FastifyRequest<{
    Params: {
        id: string;
    };
}>;
export declare function getUserHandler(request: GetUserRequest, reply: FastifyReply): Promise<{
    id: number;
    email: string;
    created_at: string;
}>;
export {};
//# sourceMappingURL=handlers.d.ts.map