import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function runMigrations() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // bootstrap migration table
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
                `);
        const applied = await client.query('SELECT version FROM schema_migrations');
        const appliedSet = new Set(applied.rows.map(r => r.version));
        const dir = path.resolve(process.cwd(), 'src/db/migrations');
        const files = fs.readdirSync(dir).sort();
        for (const file of files) {
            if (!file.endsWith('.sql'))
                continue;
            if (appliedSet.has(file))
                continue;
            const sql = fs.readFileSync(path.join(dir, file), 'utf8');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
            console.log(`Applied migration: ${file}`);
        }
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
runMigrations();
//# sourceMappingURL=migrate.js.map