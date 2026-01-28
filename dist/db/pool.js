import { Pool } from 'pg';
export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'ecom',
    password: 'ecom',
    database: 'ecom',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000
});
//# sourceMappingURL=pool.js.map