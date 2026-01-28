import { Pool } from 'pg';
import type { JWT } from '@fastify/jwt';

declare module 'fastify' {
    interface FastifyInstance {
        db: Pool;
        jwt: JWT;
        logOrderEvent: (event: string, orderId: number, details?: Record<string, any>) => void;
        cache: {
            get(key: string): Promise<any | null>;
            set(key: string, value: any, ttlSeconds?: number): Promise<void>;
            del(key: string): Promise<void>;
        };
    }

    interface FastifyRequest {
        user?: {
            id: number;
            email: string;
            role: 'USER' | 'ADMIN';
        };
    }
}