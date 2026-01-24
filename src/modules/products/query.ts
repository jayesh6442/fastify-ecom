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

// ✅ ADD THIS BELOW — WRITE PATH
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
        // @ts-ignore
        const productId = productRes.rows[0].id;

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



export async function createOrder(
    db: Pool,
    userId: number,
    productId: number,
    qty: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 🔒 Lock inventory row
        const inventoryRes = await client.query<{
            quantity: number;
        }>(
            `
      SELECT quantity
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
            [productId]
        );

        if (inventoryRes.rowCount === 0) {
            throw new Error('Inventory not found');
        }
        // @ts-ignore
        const available = inventoryRes.rows[0].quantity;

        if (available < qty) {
            throw new Error('Insufficient inventory');
        }

        // Reduce inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2
      `,
            [qty, productId]
        );

        // Create order
        const orderRes = await client.query<{ id: number }>(
            `
      INSERT INTO orders (user_id, status, total_cents)
      VALUES ($1, 'CREATED', 0)
      RETURNING id
      `,
            [userId]
        );

        await client.query('COMMIT');
        // @ts-ignore
        return { order_id: orderRes.rows[0].id };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
