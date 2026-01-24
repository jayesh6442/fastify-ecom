// import fp from 'fastify-plugin';
// import { pool } from '../db/pool.js';
// export default fp(async (app) => {
//     app.decorate('db', pool);
//     app.addHook('onClose', async () => {
//         await pool.end();
//     });
// });
// src/plugins/db.ts
import fp from 'fastify-plugin';
import { pool } from '../db/pool.js';
export async function dbPlugin(app) {
    app.decorate('db', pool);
    app.addHook('onClose', async () => {
        await pool.end();
    });
}
export default fp(dbPlugin);
//# sourceMappingURL=db.js.map