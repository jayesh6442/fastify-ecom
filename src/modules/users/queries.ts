import { Pool } from 'pg';

export async function createUser(
    db: Pool,
    email: string,
    passwordHash: string
) {
    const result = await db.query<{ id: number }>(
        `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id
    `,
        [email, passwordHash]
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
