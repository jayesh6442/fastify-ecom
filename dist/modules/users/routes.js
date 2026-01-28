import { createUserBody, userResponse } from "./schemas.js";
import { createUserHandler, getUserHandler } from "./handlers.js";
export async function userRoutes(app) {
    // POST /users
    app.post('/users', {
        schema: {
            body: createUserBody
        }
    }, createUserHandler);
    // GET /users/:id
    app.get('/users/:id', {
        schema: {
            response: {
                200: userResponse
            }
        }
    }, getUserHandler);
}
//# sourceMappingURL=routes.js.map