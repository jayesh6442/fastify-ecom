# Testing Guide & Application Flow

## Prerequisites

1. **Database Setup**
   ```bash
   # Make sure PostgreSQL is running
   # Update connection details in src/db/pool.ts if needed
   # Run migrations
   npm run build
   node dist/db/migrate.js
   ```

2. **Environment Variables**
   ```bash
   export JWT_SECRET="your-secret-key-here"
   export LOG_LEVEL="info"
   export NODE_ENV="development"
   ```

3. **Start the Server**
   ```bash
   npm run build
   npm run dev
   # Server runs on http://localhost:3000
   ```

## Application Flow

### 1. Authentication Flow
```
User Registration → Login → JWT Token → Protected Routes
```

### 2. Order Flow (User)
```
1. Register/Login → Get JWT Token
2. Browse Products (GET /products)
3. Create Order (POST /orders) → Requires Auth + Idempotency-Key
4. View Orders (GET /me/orders)
5. Pay Order (POST /orders/:id/pay)
6. Cancel Order (POST /orders/:id/cancel) - if needed
```

### 3. Admin Flow
```
1. Login as Admin → Get JWT Token
2. Create Products (POST /products)
3. Manage Inventory (POST /inventory/:productId/add|remove)
4. View All Orders (GET /admin/orders)
5. Monitor System (logs, pool status)
```

## Testing Scenarios

### Step 1: Health Check
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","db":true}
```

### Step 2: Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
# Response: {"token":"...","user":{"id":1,"email":"user@example.com","role":"USER"}}
# Save the token!
```

### Step 3: Register an Admin (or update DB)
```bash
# Option 1: Register and manually update DB
# Option 2: Use SQL
psql -U ecom -d ecom -c "UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';"
```

### Step 4: Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
# Response: {"token":"...","user":{...}}
# Save the token as USER_TOKEN
```

### Step 5: List Products (Public)
```bash
curl http://localhost:3000/products?limit=10&offset=0
# Response: []
```

### Step 6: Create Product (Admin Only)
```bash
# First, get admin token (login as admin or update user role)
export ADMIN_TOKEN="your-admin-jwt-token"

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Laptop",
    "price_cents": 99999,
    "initial_quantity": 10
  }'
# Response: {"id":1}
```

### Step 7: List Products Again
```bash
curl http://localhost:3000/products
# Response: [{"id":1,"name":"Laptop","price_cents":99999,"active":true,"created_at":"..."}]
```

### Step 8: Add Inventory (Admin)
```bash
curl -X POST http://localhost:3000/inventory/1/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "quantity": 5
  }'
# Response: {"product_id":1,"previous_quantity":10,"added":5,"new_quantity":15}
```

### Step 9: Create Order (User)
```bash
export USER_TOKEN="your-user-jwt-token"
export IDEMPOTENCY_KEY="order-$(date +%s)"

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
# Response: {"order_id":1}
```

### Step 10: View User Orders
```bash
curl http://localhost:3000/me/orders \
  -H "Authorization: Bearer $USER_TOKEN"
# Response: [{"id":1,"user_id":1,"status":"CREATED","total_cents":0,"created_at":"..."}]
```

### Step 11: Get Order by ID
```bash
curl http://localhost:3000/orders/1 \
  -H "Authorization: Bearer $USER_TOKEN"
# Response: {"id":1,"user_id":1,"status":"CREATED",...}
```

### Step 12: Pay Order
```bash
curl -X POST http://localhost:3000/orders/1/pay \
  -H "Authorization: Bearer $USER_TOKEN"
# Response: {"id":1,"user_id":1,"old_status":"CREATED","new_status":"PAID"}
```

### Step 13: Cancel Order (if still CREATED)
```bash
# Create another order first
export IDEMPOTENCY_KEY2="order-$(date +%s)-2"
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY2" \
  -d '{"product_id": 1, "quantity": 1}'
# Save order_id from response

# Cancel it
curl -X POST http://localhost:3000/orders/2/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 1
  }'
# Response: {"id":2,"user_id":1,"old_status":"CREATED","new_status":"CANCELLED"}
```

### Step 14: Admin - View All Orders
```bash
curl http://localhost:3000/admin/orders?limit=20 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Response: [{"id":1,...},{"id":2,...}]
```

### Step 15: Test Error Cases

#### Unauthorized Access
```bash
curl http://localhost:3000/me/orders
# Expected: 401 Unauthorized
```

#### Invalid Product (Inactive)
```bash
# Deactivate product (via SQL or add endpoint)
# Then try to order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: test-invalid" \
  -d '{"product_id": 1, "quantity": 1}'
# Expected: 400 "Product is not available for purchase"
```

#### Insufficient Inventory
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: test-insufficient" \
  -d '{"product_id": 1, "quantity": 1000}'
# Expected: 409 "Insufficient inventory"
```

#### Invalid State Transition
```bash
# Try to pay an already paid order
curl -X POST http://localhost:3000/orders/1/pay \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 400 "Order cannot transition from PAID to PAID"
```

## Application Architecture Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         Fastify Server              │
│  ┌──────────────────────────────┐  │
│  │   JWT Plugin (Auth)          │  │
│  │   - Verify Token             │  │
│  │   - Attach User to Request   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Error Handler              │  │
│  │   - Map DB Errors            │  │
│  │   - User-friendly Responses  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Observability              │  │
│  │   - Request Logging          │  │
│  │   - Slow Query Detection     │  │
│  │   - Pool Monitoring          │  │
│  └──────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       │ Route Handler
       ▼
┌─────────────────────────────────────┐
│      Module Handlers                │
│  - Auth (register, login)           │
│  - Products (list, create)          │
│  - Orders (create, read, pay, cancel)│
│  - Inventory (add, remove)          │
│  - Users (read)                     │
└──────┬──────────────────────────────┘
       │
       │ Database Query
       ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  - Users (with roles)               │
│  - Products (with active flag)      │
│  - Inventory (with constraints)      │
│  - Orders (with status)             │
│  - Inventory Audit                  │
└─────────────────────────────────────┘
```

## Key Features

### 1. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (USER vs ADMIN)
- Protected routes with `requireUser` and `requireAdmin`

### 2. **Order Management**
- Idempotent order creation (via Idempotency-Key header)
- State machine: CREATED → PAID | CANCELLED
- Inventory automatically deducted on order creation
- Inventory restored on cancellation

### 3. **Inventory Management**
- Admin-only inventory adjustments
- Audit logging for all changes
- Transactional safety (no negative inventory)

### 4. **Error Handling**
- Centralized error handler
- Database errors mapped to user-friendly messages
- No sensitive information leaked

### 5. **Observability**
- Request/response logging
- Slow query detection
- Connection pool monitoring
- Order lifecycle events

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Health Check"
curl -s $BASE_URL/health | jq .

echo -e "\n2. Register User"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}')
echo $USER_RESPONSE | jq .
USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.token')

echo -e "\n3. List Products"
curl -s $BASE_URL/products | jq .

echo -e "\n4. Create Order (should fail - no products)"
curl -s -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: test-1" \
  -d '{"product_id":1,"quantity":1}' | jq .

echo -e "\nDone! Check server logs for observability metrics."
```

Make it executable: `chmod +x test-api.sh`
