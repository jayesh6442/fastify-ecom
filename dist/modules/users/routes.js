import { userResponse } from "./schemas.js";
import { getUserHandler } from "./handlers.js";
export async function userRoutes(app) {
    // GET /users/:id — fetch user by id (e.g. profile lookup)
    app.get('/users/:id', {
        schema: {
            response: {
                200: userResponse
            }
        }
    }, getUserHandler);
}
//# sourceMappingURL=routes.js.map