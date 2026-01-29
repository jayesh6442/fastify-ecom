export async function createOrder(db, userId, productId, qty, idempotencyKey, shippingAddress) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        // Check for existing order with same idempotency key
        const existing = await client.query(`
      SELECT id
      FROM orders
      WHERE idempotency_key = $1
      `, [idempotencyKey]);
        if (existing.rowCount && existing.rowCount > 0) {
            await client.query('ROLLBACK');
            const existingOrder = existing.rows[0];
            if (!existingOrder) {
                throw new Error('Unexpected error: order exists but row is missing');
            }
            return { order_id: existingOrder.id };
        }
        // Check if product is active
        const productRes = await client.query(`
      SELECT active
      FROM products
      WHERE id = $1
      `, [productId]);
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
        const inventoryRes = await client.query(`
      SELECT quantity
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `, [productId]);
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
        // Get product price
        const productPriceRes = await client.query(`
      SELECT price_cents
      FROM products
      WHERE id = $1
      `, [productId]);
        const productPrice = productPriceRes.rows[0];
        if (!productPrice) {
            throw new Error('Product price not found');
        }
        // Calculate total
        const totalCents = productPrice.price_cents * qty;
        // Update inventory
        await client.query(`
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2
      `, [qty, productId]);
        // Insert order
        const orderRes = await client.query(`
      INSERT INTO orders (user_id, status, total_cents, idempotency_key, shipping_address)
      VALUES ($1, 'CREATED', $2, $3, $4)
      RETURNING id
      `, [userId, totalCents, idempotencyKey, shippingAddress ?? null]);
        const order = orderRes.rows[0];
        if (!order) {
            throw new Error('Failed to create order');
        }
        // Insert order item
        await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price_cents)
      VALUES ($1, $2, $3, $4)
      `, [order.id, productId, qty, productPrice.price_cents]);
        await client.query('COMMIT');
        return { order_id: order.id };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
export async function getOrderById(db, orderId, userId) {
    let query = `
    SELECT o.id, o.user_id, o.status, o.total_cents, o.created_at,
           o.shipping_address, o.tracking_number, o.shipped_at, o.delivered_at,
           o.razorpay_order_id, o.razorpay_payment_id,
           COALESCE(
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price_cents', oi.price_cents
               )
             ) FILTER (WHERE oi.id IS NOT NULL),
             '[]'::json
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1
    `;
    const params = [orderId];
    // If userId provided, enforce user can only see their own orders
    if (userId !== undefined) {
        query += ` AND o.user_id = $2`;
        params.push(userId);
    }
    query += ` GROUP BY o.id`;
    const result = await db.query(query, params);
    if (!result.rowCount || result.rowCount === 0) {
        return null;
    }
    return result.rows[0] ?? null;
}
export async function getUserOrders(db, userId, limit = 20, offset = 0) {
    const result = await db.query(`
    SELECT id, user_id, status, total_cents, created_at, shipping_address, tracking_number, shipped_at, delivered_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return result.rows;
}
export async function getAllOrders(db, limit = 20, offset = 0) {
    const result = await db.query(`
    SELECT id, user_id, status, total_cents, created_at, shipping_address, tracking_number, shipped_at, delivered_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return result.rows;
}
export async function updateOrderStatus(db, orderId, newStatus, expectedStatus, razorpayIds) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const currentRes = await client.query(`SELECT id, status, user_id FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
        if (!currentRes.rowCount || currentRes.rowCount === 0) {
            throw new Error('Order not found');
        }
        const current = currentRes.rows[0];
        if (current.status !== expectedStatus) {
            throw new Error(`Order cannot transition from ${current.status} to ${newStatus}`);
        }
        if (newStatus === 'PAID' && razorpayIds) {
            await client.query(`UPDATE orders SET status = $1, razorpay_order_id = $2, razorpay_payment_id = $3 WHERE id = $4`, [newStatus, razorpayIds.order_id, razorpayIds.payment_id, orderId]);
        }
        else {
            await client.query(`UPDATE orders SET status = $1 WHERE id = $2`, [newStatus, orderId]);
        }
        await client.query('COMMIT');
        return {
            id: current.id,
            user_id: current.user_id,
            old_status: current.status,
            new_status: newStatus
        };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
export async function setOrderRazorpayOrderId(db, orderId, razorpayOrderId) {
    await db.query(`UPDATE orders SET razorpay_order_id = $1 WHERE id = $2`, [razorpayOrderId, orderId]);
}
export async function getOrderByRazorpayOrderId(db, razorpayOrderId) {
    const result = await db.query(`SELECT id, status, user_id FROM orders WHERE razorpay_order_id = $1`, [razorpayOrderId]);
    if (!result.rowCount || result.rowCount === 0)
        return null;
    return result.rows[0] ?? null;
}
const VALID_TRANSITIONS = {
    PAID: ['PROCESSING'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED']
};
export async function updateOrderShippingStatus(db, orderId, newStatus, trackingNumber) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const currentRes = await client.query(`SELECT id, status, user_id FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
        if (!currentRes.rowCount || currentRes.rowCount === 0) {
            throw new Error('Order not found');
        }
        const current = currentRes.rows[0];
        const allowed = VALID_TRANSITIONS[current.status];
        if (!allowed || !allowed.includes(newStatus)) {
            throw new Error(`Order cannot transition from ${current.status} to ${newStatus}`);
        }
        if (newStatus === 'SHIPPED') {
            await client.query(`UPDATE orders SET status = $1, tracking_number = $2, shipped_at = now() WHERE id = $3`, [newStatus, trackingNumber ?? null, orderId]);
        }
        else if (newStatus === 'DELIVERED') {
            await client.query(`UPDATE orders SET status = $1, delivered_at = now() WHERE id = $2`, [newStatus, orderId]);
        }
        else {
            await client.query(`UPDATE orders SET status = $1 WHERE id = $2`, [newStatus, orderId]);
        }
        await client.query('COMMIT');
        return {
            id: current.id,
            user_id: current.user_id,
            old_status: current.status,
            new_status: newStatus
        };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
// Note: For a complete implementation, we'd need order_items table
// For now, we'll need to pass product_id and quantity when canceling
export async function getOrderItems(db, orderId) {
    const result = await db.query(`
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = $1
    `, [orderId]);
    return result.rows;
}
export async function restoreInventoryForOrder(db, orderId) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        // Get all order items
        const items = await getOrderItems(client, orderId);
        // Restore inventory for each item
        for (const item of items) {
            // Lock inventory
            const inventoryRes = await client.query(`
          SELECT quantity
          FROM inventory
          WHERE product_id = $1
          FOR UPDATE
          `, [item.product_id]);
            if (!inventoryRes.rowCount || inventoryRes.rowCount === 0) {
                throw new Error(`Inventory not found for product ${item.product_id}`);
            }
            // Restore inventory
            await client.query(`
          UPDATE inventory
          SET quantity = quantity + $1
          WHERE product_id = $2
          `, [item.quantity, item.product_id]);
            // Log audit
            try {
                const current = inventoryRes.rows[0];
                if (current) {
                    await client.query(`
            INSERT INTO inventory_audit (product_id, change_type, quantity_change, new_quantity)
            VALUES ($1, 'CANCEL', $2, $3)
            `, [item.product_id, item.quantity, current.quantity + item.quantity]);
                }
            }
            catch {
                // Audit table might not exist yet
            }
        }
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=query.js.map