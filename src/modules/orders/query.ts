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

        // Check for existing order with same idempotency key
        const existing = await client.query<{ id: number }>(
            `
      SELECT id
      FROM orders
      WHERE idempotency_key = $1
      `,
            [idempotencyKey]
        );

        if (existing.rowCount && existing.rowCount > 0) {
            await client.query('ROLLBACK');
            const existingOrder = existing.rows[0];
            if (!existingOrder) {
                throw new Error('Unexpected error: order exists but row is missing');
            }
            return { order_id: existingOrder.id };
        }

        // Lock inventory row
        const inventoryRes = await client.query<{ quantity: number }>(
            `
      SELECT quantity
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
            [productId]
        );

        if (!inventoryRes.rowCount || inventoryRes.rowCount === 0) {
            throw new Error('Inventory not found');
        }

        const inventory = inventoryRes.rows[0];
        if (!inventory) {
            throw new Error('Unexpected error: inventory row is missing');
        }

        if (inventory.quantity < qty) {
            throw new Error('Insufficient inventory');
        }

        // Update inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2
      `,
            [qty, productId]
        );

        // Insert order
        const orderRes = await client.query<{ id: number }>(
            `
      INSERT INTO orders (user_id, status, total_cents, idempotency_key)
      VALUES ($1, 'CREATED', 0, $2)
      RETURNING id
      `,
            [userId, idempotencyKey]
        );

        await client.query('COMMIT');

        const order = orderRes.rows[0];
        if (!order) {
            throw new Error('Failed to create order');
        }

        return { order_id: order.id };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
