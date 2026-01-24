import { Pool } from 'pg';
export async function createUser(db, email, passwordHash) {
    const result = await db.query(`
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id
    `, [email, passwordHash]);
    return { id: result.rows?.[0]?.id };
}
export async function getUserById(db, id) {
    const result = await db.query(`
    SELECT id, email, created_at
    FROM users
    WHERE id = $1
    `, [id]);
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}
//# sourceMappingURL=queries.js.map