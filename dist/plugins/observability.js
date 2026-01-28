import fp from 'fastify-plugin';
async function observabilityPlugin(app) {
    // Request logging with timing
    app.addHook('onRequest', async (request) => {
        request.startTime = Date.now();
    });
    // Response logging with timing and status
    app.addHook('onResponse', async (request, reply) => {
        const duration = Date.now() - (request.startTime || Date.now());
        // Log slow requests (>1 second)
        if (duration > 1000) {
            app.log.warn({
                method: request.method,
                url: request.url,
                statusCode: reply.statusCode,
                duration: `${duration}ms`,
                userId: request.user?.id
            }, 'Slow request detected');
        }
        // Structured request log
        app.log.info({
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            duration: `${duration}ms`,
            userId: request.user?.id,
            userRole: request.user?.role
        }, 'Request completed');
    });
    // Database connection pool monitoring
    setInterval(() => {
        const pool = app.db;
        app.log.info({
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
        }, 'Database pool status');
    }, 60000); // Every minute
    // Order lifecycle logging helper
    app.decorate('logOrderEvent', (event, orderId, details) => {
        app.log.info({
            event,
            orderId,
            ...details
        }, `Order event: ${event}`);
    });
}
export default fp(observabilityPlugin);
//# sourceMappingURL=observability.js.map