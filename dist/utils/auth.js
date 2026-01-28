export async function requireUser(request, reply) {
    try {
        const decoded = await request.jwtVerify();
        request.user = decoded;
    }
    catch {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
}
export async function requireAdmin(request, reply) {
    try {
        const decoded = await request.jwtVerify();
        request.user = decoded;
    }
    catch {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
    const user = request.user;
    if (!user || user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }
}
//# sourceMappingURL=auth.js.map