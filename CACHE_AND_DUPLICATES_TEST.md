# Testing: Duplicate Products & Redis Cache

## What Was Fixed

### 1. Duplicate Product Prevention ✅
- **Migration**: `010_products_unique_name.sql` - Adds UNIQUE constraint on product name
- **Application Check**: `createProduct` now checks for existing products before inserting
- **Error Handling**: Returns 409 Conflict with clear error message

### 2. Redis Cache Implementation ✅
- **Products List**: Cached with 60-second TTL
- **Cache Invalidation**: Automatically clears cache when new products are created
- **Cache Logging**: Added debug logs for cache hits/misses
- **Fallback**: Uses in-memory cache if Redis is not available

## How to Test

### Option 1: Run the Test Script
```bash
./test-cache-and-duplicates.sh
```

This script will:
1. Test cache status
2. Test cache functionality
3. Create a product
4. Try to create duplicate (should fail)
5. Test cache performance (second request should be faster)
6. Verify cache invalidation

### Option 2: Manual Testing

#### Test Duplicate Prevention:
```bash
# 1. Create product
curl -X POST http://localhost:3000/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Test Product", "price_cents": 5000, "initial_quantity": 10}'

# 2. Try to create duplicate (should fail with 409)
curl -X POST http://localhost:3000/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Test Product", "price_cents": 6000, "initial_quantity": 5}'
# Expected: {"error": "Product with this name already exists"}
```

#### Test Redis Cache:
```bash
# 1. Check cache status
curl http://localhost:3000/v1/cache/stats

# 2. Test cache functionality
curl http://localhost:3000/v1/cache/test

# 3. Test products list caching
# First request (cache miss - slower)
time curl -s http://localhost:3000/v1/products > /dev/null

# Second request (cache hit - faster)
time curl -s http://localhost:3000/v1/products > /dev/null
```

## Expected Results

### Duplicate Prevention:
- ✅ First product with name "Test Product" → Success (201)
- ❌ Second product with same name → Error (409 Conflict)
- ✅ Product with different name → Success (201)

### Cache Testing:
- ✅ `/v1/cache/test` should return `cache_working: true`
- ✅ First `/v1/products` request → Cache miss (slower)
- ✅ Second `/v1/products` request → Cache hit (faster)
- ✅ After creating product → Cache invalidated (new product appears)

## Cache Behavior

### With Redis:
- Cache type: `Redis`
- Persistent across server restarts
- Shared across multiple instances
- Better performance for large datasets

### Without Redis (Fallback):
- Cache type: `In-memory`
- Lost on server restart
- Per-instance cache
- Still functional for single-instance deployments

## Migration Required

Run the new migration to add unique constraint:
```bash
npm run build
npm run migrate
```

This will create the `products_name_unique` constraint.

## Debugging

### Check Cache Logs:
Look for these log messages:
- `Cache hit for products list` - Cache is working
- `Cache miss - stored products list` - Cache miss, storing
- `Invalidated products cache after creation` - Cache cleared

### Check Redis Connection:
```bash
# If Redis is running
redis-cli ping
# Should return: PONG

# Check if app is using Redis
curl http://localhost:3000/v1/cache/stats
# Should show: "cache_type": "Redis"
```

## Troubleshooting

### Duplicate Products Still Allowed?
1. Check if migration ran: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_name = 'products_name_unique';`
2. Check application logs for error handling
3. Verify error handler is mapping 23505 (unique violation) correctly

### Cache Not Working?
1. Check Redis connection: `redis-cli ping`
2. Check `REDIS_URL` in `.env` file
3. Check server logs for cache-related messages
4. Verify cache plugin is registered in `app.ts`
5. Test with `/v1/cache/test` endpoint
