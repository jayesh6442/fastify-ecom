import fp from 'fastify-plugin';
import { pool } from '../db/pool.js';
async function dbPlugin(app) {
    app.decorate('db', pool);
    app.addHook('onClose', async () => {
        await pool.end();
    });
}
export default fp(dbPlugin);
//# sourceMappingURL=db.js.map