import { Pool } from 'pg';

export async function createUser(
    db: Pool,
    email: string,
    passwordHash: string,
    role: 'USER' | 'ADMIN' = 'USER'
) {
    const result = await db.query<{ id: number }>(
        `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
        [email, passwordHash, role]
    );

    const user = result.rows[0];
    if (!user) {
        throw new Error('Failed to create user');
    }

    return { id: user.id };
}

export async function getUserById(
    db: Pool,
    id: number
) {
    const result = await db.query<{
        id: number;
        email: string;
        created_at: string;
    }>(
        `
    SELECT id, email, created_at
    FROM users
    WHERE id = $1
    `,
        [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
        return null;
    }

    return result.rows[0] ?? null;
}
