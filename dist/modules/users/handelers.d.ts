import type { FastifyRequest } from "fastify";
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
    id: number | undefined;
}>;
export declare function getUserHandler(request: GetUserRequest): Promise<any>;
export {};
//# sourceMappingURL=handelers.d.ts.map