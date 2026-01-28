import { createOrderBody } from './schemas.js';
import { createOrderHandler } from './handlers.js';
export async function orderRoutes(app) {
    app.post('/orders', {
        schema: {
            body: createOrderBody
        }
    }, createOrderHandler);
}
//# sourceMappingURL=routes.js.map