import type { FastifyInstance } from "fastify";
import { userResponse } from "./schemas.js";
import { getUserHandler } from "./handlers.js";

export async function userRoutes(app: FastifyInstance) {
    // GET /users/:id — fetch user by id (e.g. profile lookup)
    app.get(
        '/users/:id',
        {
            schema: {
                response: {
                    200: userResponse
                }
            }
        },
        getUserHandler
    );
}
