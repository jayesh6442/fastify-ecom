import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';

async function jwtPlugin(app: FastifyInstance) {
    await app.register(jwt, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    });
}

export default fp(jwtPlugin);
