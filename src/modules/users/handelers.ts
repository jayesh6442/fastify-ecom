import type { FastifyRequest } from "fastify";
import { createUser, getUserById } from "./queries.js";

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

export async function createUserHandler(
    request: CreateUserRequest
) {
    const { email } = request.body;

    // fake password hash for now
    return createUser(
        request.server.db,
        email,
        'noop'
    );
}

export async function getUserHandler(
    request: GetUserRequest
) {
    const id = Number(request.params.id);

    const user = await getUserById(
        request.server.db,
        id
    );

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}
