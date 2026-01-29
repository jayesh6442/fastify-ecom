import type { FastifyInstance } from 'fastify';
export declare function orderRoutes(app: FastifyInstance): Promise<void>;
/** Register webhook route with raw body parser (must be on same prefix as order routes). */
export declare function webhookRoutes(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=routes.d.ts.map