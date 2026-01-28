# E-Commerce Backend API

A production-ready e-commerce backend API built with Fastify, PostgreSQL, and TypeScript.

## Features

- ✅ Authentication & Authorization (JWT, RBAC)
- ✅ Product Management
- ✅ Inventory Management with Audit Logging
- ✅ Order Processing with State Machine
- ✅ Payment Integration (Stripe)
- ✅ Email Notifications
- ✅ Rate Limiting
- ✅ API Versioning (v1)
- ✅ Caching Layer (Redis/in-memory)
- ✅ Comprehensive Error Handling
- ✅ Observability & Monitoring
- ✅ Docker Support
- ✅ CI/CD Pipeline

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

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable documentation.

Key variables:
- `JWT_SECRET` - Required for JWT token signing
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuration
- `REDIS_URL` - Redis connection (optional)
- `SMTP_*` - Email configuration (optional)
- `STRIPE_SECRET_KEY` - Payment processing (optional)

## API Endpoints

All routes are versioned under `/v1`:

### Public
- `GET /health` - Health check
- `GET /v1/products` - List products
- `POST /v1/auth/register` - Register user
- `POST /v1/auth/login` - Login user

### User (requires auth)
- `POST /v1/orders` - Create order
- `GET /v1/orders/:id` - Get order
- `GET /v1/me/orders` - List user orders
- `POST /v1/orders/:id/pay` - Pay order
- `POST /v1/orders/:id/cancel` - Cancel order
- `POST /v1/orders/:id/payment` - Create payment intent
- `POST /v1/orders/:id/payment/confirm` - Confirm payment

### Admin (requires admin role)
- `POST /v1/products` - Create product
- `POST /v1/inventory/:productId/add` - Add inventory
- `POST /v1/inventory/:productId/remove` - Remove inventory
- `GET /v1/admin/orders` - List all orders

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
│   ├── payment.ts  # Stripe integration
│   └── email.ts    # Email service
├── db/              # Database
│   ├── migrations/ # SQL migrations
│   └── pool.ts     # Connection pool
└── __tests__/       # Test files
```

## Documentation

- [APPLICATION_OVERVIEW.md](./APPLICATION_OVERVIEW.md) - Complete technical overview
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Detailed testing instructions
- [ENHANCEMENTS.md](./ENHANCEMENTS.md) - Enhancement features
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables guide

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
