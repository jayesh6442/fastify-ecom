import { listProductsQuery, listProductsResponse } from './schemas.js';
import { createProductHandler, listProductsHandler } from './handlers.js';
import { requireAdmin } from '../../utils/auth.js';
export async function productRoutes(app) {
    app.get('/products', {
        schema: {
            querystring: listProductsQuery,
            response: {
                200: listProductsResponse
            }
        }
    }, listProductsHandler);
    app.post('/products', {
        preHandler: [requireAdmin],
    }, createProductHandler);
}
//# sourceMappingURL=route.js.map