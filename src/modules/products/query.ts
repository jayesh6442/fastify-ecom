import { Pool } from 'pg';

export async function listProducts(
    db: Pool,
    limit: number,
    offset: number
) {
    const result = await db.query(
        `
    SELECT
      id,
      name,
      price_cents,
      active,
      created_at
    FROM products
    WHERE active = true
    ORDER BY id
    LIMIT $1 OFFSET $2
    `,
        [limit, offset]
    );

    return result.rows;
}

export async function createProduct(
    db: Pool,
    name: string,
    priceCents: number,
    initialQty: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const productRes = await client.query<{ id: number }>(
            `
      INSERT INTO products (name, price_cents)
      VALUES ($1, $2)
      RETURNING id
      `,
            [name, priceCents]
        );

        const productId = productRes.rows[0]?.id;
        if (!productId) {
            throw new Error('Failed to create product');
        }

        await client.query(
            `
      INSERT INTO inventory (product_id, quantity)
      VALUES ($1, $2)
      `,
            [productId, initialQty]
        );

        await client.query('COMMIT');

        return { id: productId };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
