import type { FastifyRequest, FastifyReply } from "fastify";
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
    request: GetUserRequest,
    reply: FastifyReply
) {
    const id = Number(request.params.id);

    if (isNaN(id) || id <= 0) {
        return reply.code(400).send({ error: 'Invalid user ID' });
    }

    const user = await getUserById(
        request.server.db,
        id
    );

    if (!user) {
        return reply.code(404).send({ error: 'User not found' });
    }

    return user;
}
