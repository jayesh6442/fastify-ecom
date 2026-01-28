import { Pool } from 'pg';
export declare function addInventory(db: Pool, productId: number, quantity: number): Promise<{
    product_id: number;
    previous_quantity: number;
    added: number;
    new_quantity: number;
}>;
export declare function removeInventory(db: Pool, productId: number, quantity: number): Promise<{
    product_id: number;
    previous_quantity: number;
    removed: number;
    new_quantity: number;
}>;
//# sourceMappingURL=queries.d.ts.map