import { createUser, getUserById } from "./queries.js";
export async function createUserHandler(request) {
    const { email } = request.body;
    // fake password hash for now
    return createUser(request.server.db, email, 'noop');
}
export async function getUserHandler(request) {
    const id = Number(request.params.id);
    const user = await getUserById(request.server.db, id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}
//# sourceMappingURL=handelers.js.map