# E-Commerce Backend API

A production-ready e-commerce backend API built with Fastify, PostgreSQL, and TypeScript.

## Features

- ✅ Authentication & Authorization (JWT, RBAC)
- ✅ Product Management
- ✅ Inventory Management with Audit Logging
- ✅ Order Processing with State Machine
- ✅ Payment Integration (Razorpay, India)
- ✅ Email Notifications
- ✅ Rate Limiting
- ✅ API Versioning (v1)
- ✅ Caching Layer (Redis/in-memory)
- ✅ Comprehensive Error Handling
- ✅ Observability & Monitoring
- ✅ Docker Support
- ✅ CI/CD Pipeline

## End-to-end flow

1. **Admin** – Register with `POST /v1/auth/register-admin` (email, password, admin_secret). Login with `POST /v1/auth/login`.
2. **Admin** – Add product: `POST /v1/products` (name, price_cents, initial_quantity). Add/remove stock: `POST /v1/inventory/:productId/add` or `.../remove`.
3. **User** – Register: `POST /v1/auth/register`. Login: `POST /v1/auth/login`.
4. **User** – Create order: `POST /v1/orders` with `product_id`, `quantity`, optional `shipping_address`, header `Idempotency-Key`.
5. **User** – Pay: `POST /v1/orders/:id/payment` → get `razorpay_order_id`, `key_id`, `amount`; complete payment on frontend with Razorpay Checkout; then `POST /v1/orders/:id/payment/confirm` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. Or Razorpay webhook marks order PAID.
6. **Admin** – Update shipping: `PATCH /v1/admin/orders/:id/status` with `status: "PROCESSING"` → then `"SHIPPED"` (optional `tracking_number`) → then `"DELIVERED"`.
7. **User** – View order and tracking: `GET /v1/orders/:id` or `GET /v1/me/orders`.

Order status flow: **CREATED** → **PAID** → **PROCESSING** → **SHIPPED** → **DELIVERED**. **CANCELLED** only from CREATED.

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis (optional, falls back to in-memory cache)
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ingress
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run migrations:**
   ```bash
   npm run build
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Docker Setup

1. **Create `.env` file** (see `.env.example`)

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## Environment Variables

Key variables (see `.env.example` for a template):
- `JWT_SECRET` - Required for JWT token signing
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuration
- `REDIS_URL` - Redis connection (optional)
- `SMTP_*` - Email configuration (optional)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Razorpay (India) payment
- `RAZORPAY_WEBHOOK_SECRET` - For webhook signature verification
- `ADMIN_REGISTRATION_SECRET` - Secret to register admin accounts

## API Endpoints

All routes are versioned under `/v1`:

### Public
- `GET /health` - Health check
- `GET /v1/products` - List products
- `POST /v1/auth/register` - Register user
- `POST /v1/auth/register-admin` - Register admin (body: `email`, `password`, `admin_secret`)
- `POST /v1/auth/login` - Login user

### User (requires auth)
- `POST /v1/orders` - Create order (body: `product_id`, `quantity`, optional `shipping_address`; header: `Idempotency-Key`)
- `GET /v1/orders/:id` - Get order (includes shipping & tracking)
- `GET /v1/me/orders` - List user orders
- `POST /v1/orders/:id/payment` - Create Razorpay order (returns `razorpay_order_id`, `key_id`, `amount` in paise)
- `POST /v1/orders/:id/payment/confirm` - Confirm payment (body: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`)
- `POST /v1/orders/:id/pay` - Mark order paid (manual/testing)
- `POST /v1/orders/:id/cancel` - Cancel order (CREATED only)

### Admin (requires admin role)
- `POST /v1/products` - Create product (body: `name`, `price_cents`, `initial_quantity`)
- `POST /v1/inventory/:productId/add` - Add inventory
- `POST /v1/inventory/:productId/remove` - Remove inventory
- `GET /v1/admin/orders` - List all orders
- `PATCH /v1/admin/orders/:id/status` - Update order status (body: `status`: PROCESSING | SHIPPED | DELIVERED, optional `tracking_number`)

### Webhooks
- `POST /v1/webhooks/razorpay` - Razorpay payment.captured / order.paid (signature verified)

## Testing

### Run API Tests
```bash
# Make sure server is running
npm run dev

# In another terminal
./test-api.sh
```

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/        # Authentication
│   ├── products/    # Product management
│   ├── orders/      # Order processing
│   ├── inventory/   # Inventory management
│   └── users/       # User management
├── plugins/         # Fastify plugins
│   ├── db.ts       # Database plugin
│   ├── jwt.ts      # JWT plugin
│   ├── cache.ts    # Caching plugin
│   └── ...
├── services/        # External services
│   ├── payment.ts  # Razorpay integration
│   └── email.ts    # Email service
├── db/              # Database
│   ├── migrations/ # SQL migrations
│   └── pool.ts     # Connection pool
└── __tests__/       # Test files
```

## Development

```bash
# Development mode (with hot reload)
npm run dev

# Build
npm run build

# Run migrations
npm run migrate

# Start production server
npm start
```

## Production Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

Or use Docker:
```bash
docker-compose up -d
```

## License

ISC
