import { Pool } from 'pg';
export declare function listProducts(db: Pool, limit: number, offset: number): Promise<any[]>;
export declare function createProduct(db: Pool, name: string, priceCents: number, initialQty: number): Promise<{
    id: number;
}>;
export declare function createOrder(db: Pool, userId: number, productId: number, qty: number): Promise<{
    order_id: number;
}>;
//# sourceMappingURL=query.d.ts.map