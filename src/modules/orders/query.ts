import type { Pool } from "pg";

export async function createOrder(
    db: Pool,
    userId: number,
    productId: number,
    qty: number,
    idempotencyKey: string
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1️⃣ Check for existing order
        const existing = await client.query<{ id: number }>(
            `
      SELECT id
      FROM orders
      WHERE idempotency_key = $1 `,
            [idempotencyKey]
        );
        // @ts-ignore
        if (existing.rowCount > 0) {
            await client.query('ROLLBACK');
            // @ts-ignore
            return { order_id: existing.rows[0].id };
        }

        // 2️⃣ Lock inventory
        const inventoryRes = await client.query<{ quantity: number }>(
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
        if (inventoryRes.rows[0].quantity < qty) {
            throw new Error('Insufficient inventory');
        }

        // 3️⃣ Update inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2
      `,
            [qty, productId]
        );

        // 4️⃣ Insert order
        const orderRes = await client.query<{ id: number }>(
            `
      INSERT INTO orders (user_id, status, total_cents, idempotency_key)
      VALUES ($1, 'CREATED', 0, $2)
      RETURNING id
      `,
            [userId, idempotencyKey]
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
