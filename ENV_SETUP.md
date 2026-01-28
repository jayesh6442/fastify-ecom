# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **For Docker Compose:**
   Docker Compose automatically loads `.env` file from the project root.

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | - | `your-secret-key-min-32-chars` |

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` | `localhost` or `postgres` (Docker) |
| `DB_PORT` | PostgreSQL port | `5432` | `5432` |
| `DB_USER` | PostgreSQL user | `ecom` | `ecom` |
| `DB_PASSWORD` | PostgreSQL password | `ecom` | `ecom` |
| `DB_NAME` | PostgreSQL database name | `ecom` | `ecom` |

### Redis Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` | `redis://localhost:6379` or `redis://redis:6379` (Docker) |

### Application Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode | `development` | `development`, `production`, `test` |
| `LOG_LEVEL` | Logging level | `info` | `debug`, `info`, `warn`, `error` |
| `PORT` | Server port | `3000` | `3000` |
| `HOST` | Server host | `0.0.0.0` | `0.0.0.0` |

### Email Configuration (Optional)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SMTP_HOST` | SMTP server host | - | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` | `587` |
| `SMTP_USER` | SMTP username | - | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | - | `your-app-password` |
| `SMTP_FROM` | From email address | - | `your-email@gmail.com` |

### Payment Configuration (Optional)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | - | `sk_test_...` |

## Docker Compose Usage

When using Docker Compose, the `.env` file is automatically loaded. The `docker-compose.yml` uses these variables:

- **PostgreSQL service**: Uses `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **App service**: Uses all environment variables
- **Redis URL**: Automatically set to `redis://redis:6379` in Docker (overrides `REDIS_URL`)

### Docker-Specific Overrides

In Docker Compose, the app service automatically sets:
- `DB_HOST=postgres` (service name)
- `REDIS_URL=redis://redis:6379` (service name)

You can override these in your `.env` file if needed.

## Local Development

For local development (without Docker):

```bash
# .env file
DB_HOST=localhost
DB_PORT=5432
DB_USER=ecom
DB_PASSWORD=ecom
DB_NAME=ecom
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-secret-key
NODE_ENV=development
LOG_LEVEL=info
PORT=3000
```

## Production

For production, ensure:

1. **Strong JWT_SECRET**: At least 32 characters, random
2. **Secure DB credentials**: Use strong passwords
3. **Environment-specific values**: Different from development
4. **SMTP configured**: For email notifications
5. **Stripe keys**: Use production keys (not test keys)

```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

## Security Notes

- ⚠️ **Never commit `.env` file to git** (already in `.gitignore`)
- ✅ **Commit `.env.example`** as a template
- 🔒 **Use different secrets for each environment**
- 🔐 **Rotate secrets regularly in production**

## Example .env File

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=ecom
DB_PASSWORD=secure-password-here
DB_NAME=ecom

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info
PORT=3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```
