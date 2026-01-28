import type { Pool } from "pg";
export declare function createOrder(db: Pool, userId: number, productId: number, qty: number, idempotencyKey: string): Promise<{
    order_id: number;
}>;
export declare function getOrderById(db: Pool, orderId: number, userId?: number): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
    items: Array<{
        id: number;
        product_id: number;
        quantity: number;
        price_cents: number;
    }>;
} | null>;
export declare function getUserOrders(db: Pool, userId: number, limit?: number, offset?: number): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
}[]>;
export declare function getAllOrders(db: Pool, limit?: number, offset?: number): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
}[]>;
export declare function updateOrderStatus(db: Pool, orderId: number, newStatus: 'PAID' | 'CANCELLED', expectedStatus: 'CREATED'): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
export declare function getOrderItems(db: Pool, orderId: number): Promise<{
    product_id: number;
    quantity: number;
}[]>;
export declare function restoreInventoryForOrder(db: Pool, orderId: number): Promise<void>;
//# sourceMappingURL=query.d.ts.map