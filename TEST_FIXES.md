# Test Script Fixes

## Issues Fixed

### 1. API Versioning ✅
**Problem**: All routes now require `/v1` prefix after adding API versioning, but test script was using old routes.

**Fix**: Updated all routes in `test-api.sh` to use `/v1` prefix:
- `/auth/register` → `/v1/auth/register`
- `/products` → `/v1/products`
- `/orders` → `/v1/orders`
- `/me/orders` → `/v1/me/orders`

### 2. Product Creation Protection ✅
**Problem**: Product creation route was missing `requireAdmin` protection.

**Fix**: Added `preHandler: [requireAdmin]` to product creation route.

### 3. Error Handling ✅
**Problem**: Test script didn't check for errors or missing tokens.

**Fix**: Added error checks:
- Verify tokens are not null before using
- Exit with error if critical steps fail
- Added server health check at start

### 4. Server Health Check ✅
**Problem**: Script didn't verify server was running.

**Fix**: Added health check at the beginning of the script.

## Updated Test Script

The test script now:
1. Checks if server is running
2. Uses correct `/v1` prefixed routes
3. Validates tokens before use
4. Provides better error messages
5. Handles failures gracefully

## Running the Tests

```bash
# Make sure server is running
npm run dev

# In another terminal, run tests
./test-api.sh
```

## Common Issues

### Migration Not Run
If you see errors about missing `order_items` table:
```bash
npm run build
npm run migrate
```

### Admin Role Not Set
If product creation fails, set admin role:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin1@example.com';
```

### Rate Limiting
If you hit rate limits, wait a minute or restart the server.
