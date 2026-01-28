import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
async function jwtPlugin(app) {
    await app.register(jwt, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    });
}
export default fp(jwtPlugin);
//# sourceMappingURL=jwt.js.map