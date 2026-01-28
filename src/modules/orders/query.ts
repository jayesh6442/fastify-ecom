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

        // Check if product is active
        const productRes = await client.query<{ active: boolean }>(
            `
      SELECT active
      FROM products
      WHERE id = $1
      `,
            [productId]
        );

        if (!productRes.rowCount || productRes.rowCount === 0) {
            throw new Error('Product not found');
        }

        const product = productRes.rows[0];
        if (!product) {
            throw new Error('Unexpected error: product row is missing');
        }

        if (!product.active) {
            throw new Error('Product is not active');
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

        // Note: Logging would be done in handler where we have access to app instance
        return { order_id: order.id };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getOrderById(
    db: Pool,
    orderId: number,
    userId?: number
) {
    let query = `
    SELECT id, user_id, status, total_cents, created_at
    FROM orders
    WHERE id = $1
    `;
    const params: number[] = [orderId];

    // If userId provided, enforce user can only see their own orders
    if (userId !== undefined) {
        query += ` AND user_id = $2`;
        params.push(userId);
    }

    const result = await db.query<{
        id: number;
        user_id: number;
        status: string;
        total_cents: number;
        created_at: string;
    }>(query, params);

    if (!result.rowCount || result.rowCount === 0) {
        return null;
    }

    return result.rows[0] ?? null;
}

export async function getUserOrders(
    db: Pool,
    userId: number,
    limit: number = 20,
    offset: number = 0
) {
    const result = await db.query<{
        id: number;
        user_id: number;
        status: string;
        total_cents: number;
        created_at: string;
    }>(
        `
    SELECT id, user_id, status, total_cents, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
        [userId, limit, offset]
    );

    return result.rows;
}

export async function getAllOrders(
    db: Pool,
    limit: number = 20,
    offset: number = 0
) {
    const result = await db.query<{
        id: number;
        user_id: number;
        status: string;
        total_cents: number;
        created_at: string;
    }>(
        `
    SELECT id, user_id, status, total_cents, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
        [limit, offset]
    );

    return result.rows;
}

export async function updateOrderStatus(
    db: Pool,
    orderId: number,
    newStatus: 'PAID' | 'CANCELLED',
    expectedStatus: 'CREATED'
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Lock and check current status
        const currentRes = await client.query<{
            id: number;
            status: string;
            user_id: number;
        }>(
            `
      SELECT id, status, user_id
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `,
            [orderId]
        );

        if (!currentRes.rowCount || currentRes.rowCount === 0) {
            throw new Error('Order not found');
        }

        const current = currentRes.rows[0];
        if (!current) {
            throw new Error('Unexpected error: order row is missing');
        }

        // Validate state transition
        if (current.status !== expectedStatus) {
            throw new Error(`Order cannot transition from ${current.status} to ${newStatus}`);
        }

        // Update status
        await client.query(
            `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      `,
            [newStatus, orderId]
        );

        await client.query('COMMIT');

        return {
            id: current.id,
            user_id: current.user_id,
            old_status: current.status,
            new_status: newStatus
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Note: For a complete implementation, we'd need order_items table
// For now, we'll need to pass product_id and quantity when canceling
export async function restoreInventoryForOrder(
    db: Pool,
    productId: number,
    quantity: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Lock inventory
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

        // Restore inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity + $1
      WHERE product_id = $2
      `,
            [quantity, productId]
        );

        // Log audit
        try {
            const current = inventoryRes.rows[0];
            if (current) {
                await client.query(
                    `
          INSERT INTO inventory_audit (product_id, change_type, quantity_change, new_quantity)
          VALUES ($1, 'CANCEL', $2, $3)
          `,
                    [productId, quantity, current.quantity + quantity]
                );
            }
        } catch {
            // Audit table might not exist yet
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
