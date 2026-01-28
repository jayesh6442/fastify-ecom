import { Pool } from 'pg';
export async function getUserByEmail(db, email) {
    const result = await db.query(`
    SELECT id, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
    `, [email]);
    if (!result.rowCount || result.rowCount === 0) {
        return null;
    }
    return result.rows[0] ?? null;
}
//# sourceMappingURL=queries.js.map