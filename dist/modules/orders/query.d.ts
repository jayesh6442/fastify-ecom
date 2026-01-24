import type { Pool } from "pg";
export declare function createOrder(db: Pool, userId: number, productId: number, qty: number, idempotencyKey: string): Promise<{
    order_id: number;
}>;
//# sourceMappingURL=query.d.ts.map