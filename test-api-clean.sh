#!/bin/bash

# Clean test script - deletes test users before running
# Usage: ./test-api-clean.sh

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Clean Test Script"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Delete existing test users"
echo "2. Run the test script"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "Cleaning up test users..."
    PGPASSWORD=ecom psql -h localhost -U ecom -d ecom -c "DELETE FROM users WHERE email LIKE 'test-%@example.com' OR email LIKE 'admin-%@example.com';" 2>/dev/null || echo "Could not clean users (database might not be accessible)"
    echo "Done!"
    echo ""
else
    echo "psql not found, skipping cleanup"
    echo ""
fi

# Run the test script
./test-api.sh
