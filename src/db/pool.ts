import { Pool } from 'pg';

export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'jayesh',
    password: 'jayesh',
    database: 'jayesh',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000
});
