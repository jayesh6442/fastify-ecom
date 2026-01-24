// src/app.ts
import Fastify from 'fastify';
export function buildApp() {
    const app = Fastify({
        logger: true,
        disableRequestLogging: false,
        requestTimeout: 30_000
    });
    app.get('/health', async () => {
        return { status: 'ok' };
    });
    return app;
}
//# sourceMappingURL=app.js.map