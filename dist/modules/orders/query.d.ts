import type { Pool } from "pg";
export declare function createOrder(db: Pool, userId: number, productId: number, qty: number, idempotencyKey: string, shippingAddress?: string): Promise<{
    order_id: number;
}>;
export declare function getOrderById(db: Pool, orderId: number, userId?: number): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
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
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
}[]>;
export declare function getAllOrders(db: Pool, limit?: number, offset?: number): Promise<{
    id: number;
    user_id: number;
    status: string;
    total_cents: number;
    created_at: string;
    shipping_address: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
}[]>;
export declare function updateOrderStatus(db: Pool, orderId: number, newStatus: 'PAID' | 'CANCELLED', expectedStatus: 'CREATED', razorpayIds?: {
    order_id: string;
    payment_id: string;
}): Promise<{
    id: number;
    user_id: number;
    old_status: "CREATED";
    new_status: "PAID" | "CANCELLED";
}>;
export declare function setOrderRazorpayOrderId(db: Pool, orderId: number, razorpayOrderId: string): Promise<void>;
export declare function getOrderByRazorpayOrderId(db: Pool, razorpayOrderId: string): Promise<{
    id: number;
    status: string;
    user_id: number;
} | null>;
export type ShippingStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
export declare function updateOrderShippingStatus(db: Pool, orderId: number, newStatus: ShippingStatus, trackingNumber?: string): Promise<{
    id: number;
    user_id: number;
    old_status: string;
    new_status: ShippingStatus;
}>;
export declare function getOrderItems(db: Pool, orderId: number): Promise<{
    product_id: number;
    quantity: number;
}[]>;
export declare function restoreInventoryForOrder(db: Pool, orderId: number): Promise<void>;
//# sourceMappingURL=query.d.ts.map