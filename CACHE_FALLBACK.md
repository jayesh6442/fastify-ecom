# Cache Fallback Mechanism

## How It Works

The application uses a **smart fallback system** for caching:

1. **Primary**: Redis (if `REDIS_URL` is configured)
2. **Fallback**: In-memory cache (if Redis is not available or not configured)

## Cache Behavior

### When Redis IS Configured (`REDIS_URL` is set)

```bash
# In .env file
REDIS_URL=redis://localhost:6379
```

**Behavior**:
- ✅ Tries to connect to Redis
- ✅ If connection succeeds → Uses Redis for all cache operations
- ⚠️ If connection fails → Falls back to in-memory cache
- ✅ Cache persists across server restarts
- ✅ Shared across multiple server instances

**Logs**:
```
✅ Connected to Redis cache
Cache hit (source: Redis)
Cache set (source: Redis)
```

### When Redis IS NOT Configured

```bash
# REDIS_URL not set in .env, or empty
```

**Behavior**:
- ✅ Uses in-memory cache automatically
- ✅ No Redis connection attempted
- ⚠️ Cache is lost on server restart
- ⚠️ Each server instance has its own cache

**Logs**:
```
ℹ️  Using in-memory cache (Redis not configured - set REDIS_URL to use Redis)
Cache hit (source: In-memory)
Cache set (source: In-memory)
```

## Error Handling

### Redis Connection Failures

If Redis is configured but connection fails:
1. Logs warning: `⚠️ Redis connection failed, using in-memory cache`
2. Automatically falls back to in-memory cache
3. Application continues to work normally
4. No errors thrown to users

### Redis Operation Failures

If Redis operations fail during runtime:
1. Logs warning with error details
2. Falls back to in-memory cache for that operation
3. Subsequent operations continue normally

## Testing Cache Type

### Check Current Cache Type

```bash
# Via API endpoint
curl http://localhost:3000/v1/cache/stats

# Response:
{
  "cache_type": "In-memory",  # or "Redis"
  "redis_url": "not configured",  # or "redis://localhost:6379"
  "cache_available": true,
  "cache_working": true,
  "note": "Using in-memory cache. Set REDIS_URL to use Redis for persistent caching."
}
```

### Test Cache Functionality

```bash
curl http://localhost:3000/v1/cache/test

# Response:
{
  "cache_type": "In-memory",  # or "Redis"
  "redis_status": "not configured",  # or "configured"
  "test_key": "cache:test",
  "cached_value": {
    "message": "Hello from cache!",
    "timestamp": 1769614094493
  },
  "cache_working": true
}
```

## Configuration Examples

### Local Development (No Redis)

```bash
# .env file
# REDIS_URL not set or commented out
NODE_ENV=development
```

**Result**: Uses in-memory cache (fast, simple, no setup needed)

### Local Development (With Redis)

```bash
# .env file
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

**Result**: Uses Redis (persistent, shared)

### Docker (With Redis Service)

```bash
# .env file
REDIS_URL=redis://redis:6379  # Service name in docker-compose
```

**Result**: Uses Redis from docker-compose service

### Production

```bash
# .env file
REDIS_URL=redis://your-redis-host:6379
NODE_ENV=production
```

**Result**: Uses Redis (recommended for production)

## Cache Performance

### In-Memory Cache
- ✅ **Fastest**: No network latency
- ✅ **Simple**: No external dependencies
- ⚠️ **Limited**: Lost on restart
- ⚠️ **Per-instance**: Not shared

### Redis Cache
- ✅ **Persistent**: Survives restarts
- ✅ **Shared**: Multiple instances share cache
- ✅ **Scalable**: Can handle large datasets
- ⚠️ **Network**: Slight latency (usually < 1ms on same network)

## Monitoring

### Check Cache Status in Logs

Look for these log messages:

**Startup**:
- `✅ Connected to Redis cache` - Redis working
- `ℹ️ Using in-memory cache (Redis not configured)` - Using fallback

**Runtime**:
- `Cache hit (source: Redis)` - Redis cache hit
- `Cache hit (source: In-memory)` - In-memory cache hit
- `Cache miss` - No cache entry found
- `Cache set (source: Redis)` - Stored in Redis
- `Cache set (source: In-memory)` - Stored in memory

**Errors**:
- `⚠️ Redis connection failed` - Redis unavailable, using fallback
- `Redis get error, falling back to in-memory` - Operation failed, using fallback

## Best Practices

### Development
- **No Redis needed**: In-memory cache is fine
- **Optional Redis**: Use if you want to test Redis features

### Production
- **Always use Redis**: For persistence and scalability
- **Monitor Redis**: Set up alerts for Redis failures
- **Fallback is safe**: Application continues working if Redis fails

## Troubleshooting

### Cache Not Working?

1. **Check logs** for cache-related messages
2. **Test endpoint**: `GET /v1/cache/test`
3. **Check Redis**: `redis-cli ping` (if using Redis)
4. **Verify .env**: Check `REDIS_URL` is set correctly

### Redis Connection Issues?

1. **Check Redis is running**: `docker-compose ps redis` or `redis-cli ping`
2. **Check URL format**: `redis://host:port` or `redis://user:pass@host:port`
3. **Check network**: Can the app reach Redis?
4. **Check logs**: Look for connection error messages

### Cache Not Persisting?

- **In-memory cache**: Never persists (by design)
- **Redis cache**: Should persist (check Redis persistence settings)

## Summary

✅ **Automatic fallback**: No configuration needed
✅ **Zero downtime**: Falls back gracefully on Redis failures
✅ **Development friendly**: Works without Redis
✅ **Production ready**: Uses Redis when available
✅ **Transparent**: Logs show which cache type is used

The system is designed to **always work**, whether Redis is available or not!
