#!/bin/bash

# API Testing Script
# Make sure server is running: npm run dev

BASE_URL="http://localhost:3000"

# Check if server is running
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "ERROR: Server is not running on $BASE_URL"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "=========================================="
echo "API Testing Script"
echo "=========================================="

echo -e "\n1. Health Check"
echo "GET $BASE_URL/health"
curl -s $BASE_URL/health | jq .
echo ""

# Generate unique emails to avoid conflicts
TIMESTAMP=$(date +%s)
USER_EMAIL="test-${TIMESTAMP}@example.com"
ADMIN_EMAIL="admin-${TIMESTAMP}@example.com"
PASSWORD="test123456"

echo -e "\n2. Register User"
echo "POST $BASE_URL/v1/auth/register"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$PASSWORD\"}")
echo $USER_RESPONSE | jq .

# Check if user already exists, try login instead
if echo $USER_RESPONSE | jq -e '.error' | grep -q "already exists"; then
    echo "User exists, trying login..."
    USER_RESPONSE=$(curl -s -X POST $BASE_URL/v1/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$PASSWORD\"}")
    echo $USER_RESPONSE | jq .
fi

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.token')
if [ "$USER_TOKEN" = "null" ] || [ -z "$USER_TOKEN" ]; then
    echo "ERROR: Failed to get user token"
    exit 1
fi
echo "User Token: ${USER_TOKEN:0:20}..."
echo "User Email: $USER_EMAIL"
echo ""

echo -e "\n3. Register Admin User"
echo "POST $BASE_URL/v1/auth/register"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}")
echo $ADMIN_RESPONSE | jq .

# Check if admin already exists, try login instead
if echo $ADMIN_RESPONSE | jq -e '.error' | grep -q "already exists"; then
    echo "Admin exists, trying login..."
    ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/v1/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}")
    echo $ADMIN_RESPONSE | jq .
fi

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "ERROR: Failed to get admin token"
    exit 1
fi
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
echo "Admin Email: $ADMIN_EMAIL"
echo ""
echo "NOTE: To set admin role, run in database:"
echo "UPDATE users SET role = 'ADMIN' WHERE email = '$ADMIN_EMAIL';"
echo ""

echo -e "\n4. List Products (Public)"
echo "GET $BASE_URL/v1/products"
curl -s "$BASE_URL/v1/products?limit=10" | jq .
echo ""

echo -e "\n5. Create Product (Admin - will fail if not admin)"
echo "POST $BASE_URL/v1/products"
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Test Laptop",
    "price_cents": 99999,
    "initial_quantity": 10
  }')
echo $PRODUCT_RESPONSE | jq .
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
if [ "$PRODUCT_ID" = "null" ] || [ -z "$PRODUCT_ID" ]; then
    echo "WARNING: Failed to create product (might need admin role)"
    PRODUCT_ID=1  # Use default for testing
fi
echo ""

echo -e "\n6. List Products Again"
echo "GET $BASE_URL/v1/products"
curl -s "$BASE_URL/v1/products" | jq .
echo ""

echo -e "\n7. Create Order (User)"
echo "POST $BASE_URL/v1/orders"
IDEMPOTENCY_KEY="test-$(date +%s)"
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":2}")
echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.order_id')
if [ "$ORDER_ID" = "null" ] || [ -z "$ORDER_ID" ]; then
    echo "ERROR: Failed to create order"
    exit 1
fi
echo ""

echo -e "\n8. View User Orders"
echo "GET $BASE_URL/v1/me/orders"
curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE_URL/v1/me/orders" | jq .
echo ""

echo -e "\n9. Get Order by ID"
echo "GET $BASE_URL/v1/orders/$ORDER_ID"
curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE_URL/v1/orders/$ORDER_ID" | jq .
echo ""

echo -e "\n10. Pay Order"
echo "POST $BASE_URL/v1/orders/$ORDER_ID/pay"
curl -s -X POST "$BASE_URL/v1/orders/$ORDER_ID/pay" \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
echo ""

echo -e "\n=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "Check server logs for:"
echo "  - Request timing"
echo "  - Slow queries (>1s)"
echo "  - Database pool status"
echo "  - Order lifecycle events"
echo ""
