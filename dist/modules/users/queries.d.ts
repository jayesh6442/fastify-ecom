import { Pool } from 'pg';
export declare function createUser(db: Pool, email: string, passwordHash: string): Promise<{
    id: number | undefined;
}>;
export declare function getUserById(db: Pool, id: number): Promise<any>;
//# sourceMappingURL=queries.d.ts.map