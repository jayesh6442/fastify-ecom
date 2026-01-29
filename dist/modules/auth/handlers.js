import bcrypt from 'bcrypt';
import { getUserByEmail } from './queries.js';
import { createUser } from '../users/queries.js';
export async function registerHandler(request, reply) {
    const { email, password } = request.body;
    try {
        // Check if user already exists
        const existing = await getUserByEmail(request.server.db, email);
        if (existing) {
            return reply.code(409).send({ error: 'User already exists' });
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // Create user (default role is USER)
        const user = await createUser(request.server.db, email, passwordHash);
        // Generate JWT
        const token = request.server.jwt.sign({
            id: user.id,
            email,
            role: 'USER'
        });
        return {
            token,
            user: {
                id: user.id,
                email,
                role: 'USER'
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
export async function registerAdminHandler(request, reply) {
    const { email, password, admin_secret } = request.body;
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!expectedSecret || admin_secret !== expectedSecret) {
        return reply.code(403).send({ error: 'Invalid admin secret' });
    }
    try {
        const existing = await getUserByEmail(request.server.db, email);
        if (existing) {
            return reply.code(409).send({ error: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await createUser(request.server.db, email, passwordHash, 'ADMIN');
        const token = request.server.jwt.sign({
            id: user.id,
            email,
            role: 'ADMIN'
        });
        return {
            token,
            user: {
                id: user.id,
                email,
                role: 'ADMIN'
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
export async function loginHandler(request, reply) {
    const { email, password } = request.body;
    try {
        const user = await getUserByEmail(request.server.db, email);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        // Generate JWT
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
//# sourceMappingURL=handlers.js.map