import bcrypt from 'bcrypt';
import { getUserByEmail } from './queries.js';
import { createUser } from '../users/queries.js';
import { requireUser } from '../../utils/auth.js';
/**
 * Sign-up: register as USER, or as ADMIN if admin_secret is provided and valid.
 */
export async function signUpHandler(request, reply) {
    const { email, password, admin_secret } = request.body;
    let role = 'USER';
    if (admin_secret != null && admin_secret !== '') {
        const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
        if (!expectedSecret || admin_secret !== expectedSecret) {
            return reply.code(403).send({ error: 'Invalid admin secret' });
        }
        role = 'ADMIN';
    }
    try {
        const existing = await getUserByEmail(request.server.db, email);
        if (existing) {
            return reply.code(409).send({ error: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await createUser(request.server.db, email, passwordHash, role);
        const token = request.server.jwt.sign({
            id: user.id,
            email,
            role
        });
        return {
            token,
            user: {
                id: user.id,
                email,
                role
            }
        };
    }
    catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
/**
 * Sign-in: login with email and password.
 */
export async function signInHandler(request, reply) {
    const { email, password } = request.body;
    try {
        const user = await getUserByEmail(request.server.db, email);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const token = request.server.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }
    catch (error) {
        if (error instanceof Error) {
            return reply.code(500).send({ error: error.message });
        }
        throw error;
    }
}
/**
 * Current user from JWT (auth/me).
 */
export async function meHandler(request, reply) {
    await requireUser(request, reply);
    if (reply.sent)
        return;
    const user = request.user;
    return { id: user.id, email: user.email, role: user.role };
}
//# sourceMappingURL=handlers.js.map