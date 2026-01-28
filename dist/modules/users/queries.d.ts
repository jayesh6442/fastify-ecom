import { Pool } from 'pg';
export declare function createUser(db: Pool, email: string, passwordHash: string): Promise<{
    id: number;
}>;
export declare function getUserById(db: Pool, id: number): Promise<{
    id: number;
    email: string;
    created_at: string;
} | null>;
//# sourceMappingURL=queries.d.ts.map