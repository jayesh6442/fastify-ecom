import { createProduct, listProducts } from './query.js';
import { createOrder } from '../orders/query.js';
export async function listProductsHandler(request) {
    const { limit = 20, offset = 0 } = request.query;
    return listProducts(request.server.db, limit, offset);
}
export async function createProductHandler(request) {
    const { name, price_cents, initial_quantity } = request.body;
    return createProduct(request.server.db, name, price_cents, initial_quantity);
}
// export async function createOrderHandler(
//     request: CreateOrderRequest
// ) {
//     const { user_id, product_id, quantity } = request.body;
//     return createOrder(
//         request.server.db,
//         user_id,
//         product_id,
//         quantity
//     );
// }
export async function createOrderHandler(request) {
    const key = request.headers['idempotency-key'];
    if (!key || typeof key !== 'string') {
        throw new Error('Missing Idempotency-Key');
    }
    const { user_id, product_id, quantity } = request.body;
    return createOrder(request.server.db, user_id, product_id, quantity, key);
}
//# sourceMappingURL=handlers.js.map