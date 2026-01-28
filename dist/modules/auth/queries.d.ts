import { Pool } from 'pg';
export declare function getUserByEmail(db: Pool, email: string): Promise<{
    id: number;
    email: string;
    password_hash: string;
    role: "USER" | "ADMIN";
    created_at: string;
} | null>;
//# sourceMappingURL=queries.d.ts.map