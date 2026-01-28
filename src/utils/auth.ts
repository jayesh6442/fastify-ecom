import type { FastifyRequest, FastifyReply } from 'fastify';

type UserPayload = {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
};

export async function requireUser(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const decoded = await request.jwtVerify() as UserPayload;
        request.user = decoded;
    } catch {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
}

export async function requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const decoded = await request.jwtVerify() as UserPayload;
        request.user = decoded;
    } catch {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = request.user as UserPayload;
    if (!user || user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }
}
