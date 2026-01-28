import { Pool } from 'pg';

export async function addInventory(
    db: Pool,
    productId: number,
    quantity: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Get current inventory
        const currentRes = await client.query<{ quantity: number }>(
            `
      SELECT quantity
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
            [productId]
        );

        if (!currentRes.rowCount || currentRes.rowCount === 0) {
            throw new Error('Inventory not found');
        }

        const current = currentRes.rows[0];
        if (!current) {
            throw new Error('Unexpected error: inventory row is missing');
        }

        // Add inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity + $1
      WHERE product_id = $2
      `,
            [quantity, productId]
        );

        // Log audit (if audit table exists, otherwise skip)
        try {
            await client.query(
                `
        INSERT INTO inventory_audit (product_id, change_type, quantity_change, new_quantity)
        VALUES ($1, 'ADD', $2, $3)
        `,
                [productId, quantity, current.quantity + quantity]
            );
        } catch {
            // Audit table might not exist yet, that's okay
        }

        await client.query('COMMIT');

        return {
            product_id: productId,
            previous_quantity: current.quantity,
            added: quantity,
            new_quantity: current.quantity + quantity
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function removeInventory(
    db: Pool,
    productId: number,
    quantity: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Lock and get current inventory
        const currentRes = await client.query<{ quantity: number }>(
            `
      SELECT quantity
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
            [productId]
        );

        if (!currentRes.rowCount || currentRes.rowCount === 0) {
            throw new Error('Inventory not found');
        }

        const current = currentRes.rows[0];
        if (!current) {
            throw new Error('Unexpected error: inventory row is missing');
        }

        // Validate sufficient inventory
        if (current.quantity < quantity) {
            throw new Error('Insufficient inventory');
        }

        // Remove inventory
        await client.query(
            `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2
      `,
            [quantity, productId]
        );

        // Log audit
        try {
            await client.query(
                `
        INSERT INTO inventory_audit (product_id, change_type, quantity_change, new_quantity)
        VALUES ($1, 'REMOVE', $2, $3)
        `,
                [productId, -quantity, current.quantity - quantity]
            );
        } catch {
            // Audit table might not exist yet, that's okay
        }

        await client.query('COMMIT');

        return {
            product_id: productId,
            previous_quantity: current.quantity,
            removed: quantity,
            new_quantity: current.quantity - quantity
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
