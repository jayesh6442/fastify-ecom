import fp from 'fastify-plugin';
async function errorHandlerPlugin(app) {
    app.setErrorHandler((error, request, reply) => {
        // Log full error for debugging
        request.log.error({
            err: error,
            url: request.url,
            method: request.method,
            statusCode: error.statusCode || 500
        }, 'Request error');
        // Map database errors to user-friendly responses
        if (error.code === '23503') { // Foreign key violation
            return reply.code(400).send({
                error: 'Invalid reference: related resource does not exist'
            });
        }
        if (error.code === '23505') { // Unique violation
            if (error.message.includes('products_name_unique')) {
                return reply.code(409).send({
                    error: 'Product with this name already exists'
                });
            }
            return reply.code(409).send({
                error: 'Resource already exists'
            });
        }
        if (error.code === '23514') { // Check constraint violation
            return reply.code(400).send({
                error: 'Invalid data: constraint violation'
            });
        }
        // Map known application errors
        if (error.message === 'Insufficient inventory') {
            return reply.code(409).send({
                error: 'Insufficient inventory'
            });
        }
        if (error.message === 'Inventory not found') {
            return reply.code(404).send({
                error: 'Product inventory not found'
            });
        }
        if (error.message === 'Product not found') {
            return reply.code(404).send({
                error: 'Product not found'
            });
        }
        if (error.message === 'Product is not active') {
            return reply.code(400).send({
                error: 'Product is not available for purchase'
            });
        }
        if (error.message === 'Order not found') {
            return reply.code(404).send({
                error: 'Order not found'
            });
        }
        if (error.message.includes('cannot transition')) {
            return reply.code(400).send({
                error: error.message
            });
        }
        // Default error response (don't leak internal details)
        const statusCode = error.statusCode || 500;
        return reply.code(statusCode).send({
            error: statusCode >= 500
                ? 'Internal server error'
                : (error.message || 'An error occurred')
        });
    });
}
export default fp(errorHandlerPlugin);
//# sourceMappingURL=error-handler.js.map