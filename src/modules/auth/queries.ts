import { Pool } from 'pg';

export async function getUserByEmail(
    db: Pool,
    email: string
) {
    const result = await db.query<{
        id: number;
        email: string;
        password_hash: string;
        role: 'USER' | 'ADMIN';
        created_at: string;
    }>(
        `
    SELECT id, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
    `,
        [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
        return null;
    }

    return result.rows[0] ?? null;
}
