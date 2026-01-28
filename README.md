# Quick Start Guide

## 🚀 Getting Started

### 1. Setup Database
```bash
# Ensure PostgreSQL is running
# Update src/db/pool.ts with your DB credentials if needed
```

### 2. Run Migrations
```bash
npm run build
node dist/db/migrate.js
```

### 3. Start Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 4. Test the API
```bash
./test-api.sh
# Or follow TESTING_GUIDE.md for manual testing
```

---

## 📋 What We Built - Summary

### Core Features
1. **Authentication System**
   - User registration & login
   - JWT token-based auth
   - Role-based access (USER/ADMIN)

2. **Product Management**
   - List products (public)
   - Create products (admin only)
   - Active/inactive status

3. **Inventory Management**
   - Add/remove stock (admin only)
   - Audit logging
   - Transactional safety

4. **Order Processing**
   - Create orders (with idempotency)
   - View orders (user's own or all for admin)
   - Pay orders
   - Cancel orders (restores inventory)

5. **Error Handling**
   - Centralized error handler
   - User-friendly messages
   - Database error mapping

6. **Observability**
   - Request/response logging
   - Slow query detection
   - Connection pool monitoring

---

## 🔄 Application Flow

### User Journey
```
1. Register → Get JWT Token
2. Browse Products → GET /products
3. Create Order → POST /orders (requires Idempotency-Key)
4. View Orders → GET /me/orders
5. Pay Order → POST /orders/:id/pay
```

### Admin Journey
```
1. Login as Admin → Get JWT Token
2. Create Product → POST /products
3. Manage Inventory → POST /inventory/:id/add|remove
4. View All Orders → GET /admin/orders
```

---

## 🔐 Security Model

- **Authentication**: JWT tokens in `Authorization: Bearer <token>` header
- **Authorization**: Role-based (USER vs ADMIN)
- **Password Security**: bcrypt hashing (10 rounds)
- **Data Protection**: Users can only see their own orders

---

## 📊 Key Behaviors

### Order Creation
- Validates product is active
- Locks inventory row
- Deducts inventory atomically
- Idempotent (same key = same order)
- Creates order with status='CREATED'

### Order Payment
- Validates state (must be CREATED)
- Updates status to PAID
- Prevents duplicate payments

### Order Cancellation
- Validates state (must be CREATED)
- Updates status to CANCELLED
- Restores inventory automatically
- Logs audit trail

### Inventory Management
- Row-level locking (prevents race conditions)
- Transactional (all-or-nothing)
- Audit logging (all changes tracked)
- Validation (no negative quantities)

---

## 🗄️ Database Structure

**Tables**:
- `users` - User accounts with roles
- `products` - Product catalog
- `inventory` - Stock levels
- `orders` - Order records
- `inventory_audit` - Change history

**Key Constraints**:
- Foreign keys (referential integrity)
- CHECK constraints (no negative inventory, valid statuses)
- Unique constraints (email, idempotency_key)

---

## 📝 API Endpoints

### Public
- `GET /health` - Health check
- `GET /products` - List products
- `POST /auth/register` - Register
- `POST /auth/login` - Login

### User (requires auth)
- `POST /orders` - Create order
- `GET /orders/:id` - Get order
- `GET /me/orders` - List my orders
- `POST /orders/:id/pay` - Pay order
- `POST /orders/:id/cancel` - Cancel order

### Admin (requires admin role)
- `POST /products` - Create product
- `POST /inventory/:id/add` - Add stock
- `POST /inventory/:id/remove` - Remove stock
- `GET /admin/orders` - List all orders

---

## 🐛 Error Handling

All errors are:
- Logged with full details (for debugging)
- Mapped to user-friendly messages
- Returned with appropriate HTTP status codes
- Never leak sensitive information

**Common Errors**:
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (insufficient inventory, duplicate)
- `400` - Bad Request (invalid input, invalid state)

---

## 📈 Observability

**What's Monitored**:
- Every request (method, URL, status, duration)
- Slow requests (>1 second)
- Database connection pool status
- Order lifecycle events

**Logs Include**:
- Request timing
- User ID and role
- Error details (server-side only)
- Database pool metrics

---

## ✅ Production Ready Features

- ✅ Transactional safety (ACID)
- ✅ Row-level locking (race condition prevention)
- ✅ Idempotency (duplicate prevention)
- ✅ Audit logging (change tracking)
- ✅ Error handling (user-friendly)
- ✅ Security (password hashing, JWT)
- ✅ Observability (logging, monitoring)
- ✅ Type safety (TypeScript)
- ✅ Modular architecture

---

## 📚 Documentation Files

- **APPLICATION_OVERVIEW.md** - Complete technical overview
- **TESTING_GUIDE.md** - Detailed testing instructions
- **test-api.sh** - Automated test script
- **QUICK_START.md** - This file

---

## 🎯 Next Steps

1. **Test the API**: Run `./test-api.sh`
2. **Read Documentation**: Check APPLICATION_OVERVIEW.md
3. **Explore Endpoints**: Use TESTING_GUIDE.md
4. **Monitor Logs**: Watch server output for observability metrics

---

## 💡 Tips

- Always include `Idempotency-Key` header when creating orders
- Use JWT token in `Authorization: Bearer <token>` header
- Check server logs for detailed request/response info
- Database pool status is logged every 60 seconds
- Slow requests (>1s) are logged as warnings


