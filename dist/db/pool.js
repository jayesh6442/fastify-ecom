import { Pool } from 'pg';
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'ecom',
    password: process.env.DB_PASSWORD || 'ecom',
    database: process.env.DB_NAME || 'ecom',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000
});
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
//# sourceMappingURL=pool.js.map