import type { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from "./queries.js";

type GetUserRequest = FastifyRequest<{
    Params: {
        id: string;
    };
}>;

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
