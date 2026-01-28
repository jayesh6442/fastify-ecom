#!/bin/bash

# API Testing Script
# Make sure server is running: npm run dev

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "API Testing Script"
echo "=========================================="

echo -e "\n1. Health Check"
echo "GET $BASE_URL/health"
curl -s $BASE_URL/health | jq .
echo ""

echo -e "\n2. Register User"
echo "POST $BASE_URL/auth/register"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"test123456"}')
echo $USER_RESPONSE | jq .
USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.token')
echo "User Token: ${USER_TOKEN:0:20}..."
echo ""

echo -e "\n3. Register Admin User"
echo "POST $BASE_URL/auth/register"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@example.com","password":"admin123456"}')
echo $ADMIN_RESPONSE | jq .
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
echo ""
echo "NOTE: Update admin role in DB:"
echo "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';"
echo ""

echo -e "\n4. List Products (Public)"
echo "GET $BASE_URL/products"
curl -s "$BASE_URL/products?limit=10" | jq .
echo ""

echo -e "\n5. Create Product (Admin - will fail if not admin)"
echo "POST $BASE_URL/products"
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Test Laptop",
    "price_cents": 99999,
    "initial_quantity": 10
  }')
echo $PRODUCT_RESPONSE | jq .
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
echo ""

echo -e "\n6. List Products Again"
echo "GET $BASE_URL/products"
curl -s "$BASE_URL/products" | jq .
echo ""

echo -e "\n7. Create Order (User)"
echo "POST $BASE_URL/orders"
IDEMPOTENCY_KEY="test-$(date +%s)"
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":2}")
echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.order_id')
echo ""

echo -e "\n8. View User Orders"
echo "GET $BASE_URL/me/orders"
curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE_URL/me/orders" | jq .
echo ""

echo -e "\n9. Get Order by ID"
echo "GET $BASE_URL/orders/$ORDER_ID"
curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE_URL/orders/$ORDER_ID" | jq .
echo ""

echo -e "\n10. Pay Order"
echo "POST $BASE_URL/orders/$ORDER_ID/pay"
curl -s -X POST "$BASE_URL/orders/$ORDER_ID/pay" \
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
