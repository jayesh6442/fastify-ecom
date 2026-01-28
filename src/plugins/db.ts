import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { pool } from '../db/pool.js';

async function dbPlugin(app: FastifyInstance) {
    app.decorate('db', pool);

    app.addHook('onClose', async () => {
        await pool.end();
    });
}

export default fp(dbPlugin);
