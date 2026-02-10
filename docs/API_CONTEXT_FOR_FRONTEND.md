# Ingress API – Full Context for Frontend

This document describes the **Ingress** backend so a frontend can be built against it. It covers base URL, auth, all endpoints, request/response shapes, and data models.

---

## 1. Overview

- **Stack:** Node.js, Fastify, PostgreSQL, Redis (optional cache), JWT, Razorpay (payments).
- **API version:** All app routes live under **`/v1`**.
- **Base URL (dev):** `http://127.0.0.1:3000` (or `http://localhost:3000`). Configurable via `PORT` / `HOST`.
- **CORS:** Backend allows origin `http://localhost:42645` by default (see `app.ts`); adjust for your frontend origin.

---

## 2. Authentication

- **Mechanism:** JWT in **`Authorization: Bearer <token>`**.
- **Token payload:** `{ id: number, email: string, role: 'USER' | 'ADMIN' }`.
- **Env:** `JWT_SECRET` (defaults to a dev key; must be set in production).

**Roles:**

- **USER** – Can manage own profile, place/cancel orders, pay orders, list own orders.
- **ADMIN** – All of the above plus: create products, manage inventory, list/update all orders.

Endpoints that require auth use:
- **requireUser** – any logged-in user (USER or ADMIN).
- **requireAdmin** – only ADMIN.

---

## 3. API Endpoints Reference

All paths below are relative to the server root. Prepend base URL, e.g. `GET http://127.0.0.1:3000/health`.

### 3.1 Health (no auth)

| Method | Path        | Auth | Description                |
|--------|-------------|------|----------------------------|
| GET    | `/health`   | No   | Health check; returns DB status. |

**Response 200:**

```json
{
  "status": "ok",
  "db": true
}
```

---

### 3.2 Auth – `/v1/auth/*`

| Method | Path              | Auth | Description |
|--------|-------------------|------|-------------|
| POST   | `/v1/auth/sign-up`| No   | Register (USER or ADMIN if admin_secret valid). |
| POST   | `/v1/auth/sign-in`| No   | Login with email/password. |
| GET    | `/v1/auth/me`     | JWT  | Current user from token. |

**POST /v1/auth/sign-up**

- **Body:**
  - `email` (string, required) – valid email.
  - `password` (string, required) – min length 8.
  - `admin_secret` (string, optional) – if present and equals `ADMIN_REGISTRATION_SECRET`, user is created as ADMIN.
- **Responses:**
  - **200** – `{ "token": "<jwt>", "user": { "id": number, "email": string, "role": "USER"|"ADMIN" } }`.
  - **403** – `{ "error": "Invalid admin secret" }`.
  - **409** – `{ "error": "User already exists" }`.

**POST /v1/auth/sign-in**

- **Body:** `email` (string), `password` (string).
- **Responses:**
  - **200** – same as sign-up: `{ "token", "user": { "id", "email", "role" } }`.
  - **401** – `{ "error": "Invalid credentials" }`.

**GET /v1/auth/me**

- **Headers:** `Authorization: Bearer <token>`.
- **Response 200:** `{ "id": number, "email": string, "role": "USER"|"ADMIN" }`.
- **401:** `{ "error": "Unauthorized" }`.

---

### 3.3 Users – `/v1/users/*`

| Method | Path          | Auth | Description      |
|--------|---------------|------|------------------|
| GET    | `/v1/users/:id` | No* | Get user by ID (id in path). |

\*No JWT required in current implementation; frontend may still send it if needed later.

**GET /v1/users/:id**

- **Params:** `id` – user ID (number).
- **Response 200:** `{ "id": number, "email": string, "created_at": string }`.
- **400:** `{ "error": "Invalid user ID" }`.
- **404:** `{ "error": "User not found" }`.

---

### 3.4 Products – `/v1/products`

| Method | Path           | Auth   | Description              |
|--------|----------------|--------|--------------------------|
| GET    | `/v1/products` | No     | List products (paginated). |
| POST   | `/v1/products` | Admin  | Create product + initial inventory. |

**GET /v1/products**

- **Query:**
  - `limit` (optional) – number, 1–100, default 20.
  - `offset` (optional) – number, ≥ 0, default 0.
- **Response 200:** Array of:
  - `id` (number)
  - `name` (string)
  - `price_cents` (number)
  - `active` (boolean)
  - `created_at` (string)

**POST /v1/products** (Admin)

- **Headers:** `Authorization: Bearer <token>`.
- **Body:**
  - `name` (string, required).
  - `price_cents` (number, required) – ≥ 0.
  - `initial_quantity` (number, required) – for inventory.
- **Response 200:** `{ "id": number }` (new product id).
- **409:** `{ "error": "Product with this name already exists" }`.
- **403:** Admin required.

---

### 3.5 Inventory – `/v1/inventory/*` (Admin)

| Method | Path                                | Auth  | Description        |
|--------|-------------------------------------|-------|--------------------|
| POST   | `/v1/inventory/:productId/add`      | Admin | Add stock.         |
| POST   | `/v1/inventory/:productId/remove`   | Admin | Remove stock.      |

**POST /v1/inventory/:productId/add**

- **Params:** `productId` – product ID.
- **Body:** `{ "quantity": number }` (min 1).
- **Response 200:** Result of add (implementation-defined).
- **400:** Invalid product ID. **404:** `{ "error": "Inventory not found" }`.

**POST /v1/inventory/:productId/remove**

- **Params:** `productId`.
- **Body:** `{ "quantity": number }` (min 1).
- **Response 200:** Result of remove.
- **400:** Invalid product ID or `{ "error": "Insufficient inventory" }`. **404:** `{ "error": "Inventory not found" }`.

---

### 3.6 Orders – `/v1/orders`, `/v1/me/orders`, `/v1/admin/orders`

| Method | Path                         | Auth   | Description |
|--------|------------------------------|--------|-------------|
| POST   | `/v1/orders`                 | User   | Create order (idempotent). |
| GET    | `/v1/orders/:id`             | User   | Get order by ID (own or admin). |
| GET    | `/v1/me/orders`              | User   | List current user’s orders. |
| GET    | `/v1/admin/orders`           | Admin  | List all orders. |
| PATCH  | `/v1/admin/orders/:id/status`| Admin  | Update shipping status. |
| POST   | `/v1/orders/:id/pay`         | User   | Mark order as PAID (manual flow). |
| POST   | `/v1/orders/:id/cancel`     | User   | Cancel order (CREATED → CANCELLED). |
| POST   | `/v1/orders/:id/payment`     | User   | Create Razorpay order (get payment intent). |
| POST   | `/v1/orders/:id/payment/confirm` | User | Confirm Razorpay payment (client-side success). |

**POST /v1/orders** (User)

- **Headers:**
  - `Authorization: Bearer <token>`.
  - **`Idempotency-Key`** (string, required) – unique key per “create order” intent; same key returns same order_id.
- **Body:**
  - `product_id` (number, required) – product ID.
  - `quantity` (number, required) – min 1.
  - `shipping_address` (string, optional).
- **Response 200:** `{ "order_id": number }`.
- **400:** Missing Idempotency-Key, invalid body, or `{ "error": "Inventory not found" }` / `"Insufficient inventory"`.

**GET /v1/orders/:id** (User)

- **Params:** `id` – order ID.
- **Response 200 – Order object:**
  - `id`, `user_id`, `status`, `total_cents`, `created_at`
  - `shipping_address`, `tracking_number`, `shipped_at`, `delivered_at`
  - `razorpay_order_id`, `razorpay_payment_id` (if set)
  - `items`: array of `{ "id", "product_id", "quantity", "price_cents" }`
- **400:** Invalid order ID. **404:** Order not found. **401:** Unauthorized.

**Order status flow:**  
`CREATED` → (pay) → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED`.  
From `CREATED`, order can go to `CANCELLED`.

**GET /v1/me/orders** (User)

- **Query:** `limit` (1–100, default 20), `offset` (default 0).
- **Response 200:** Array of orders (same shape as list, without full `items` in current implementation: `id`, `user_id`, `status`, `total_cents`, `created_at`, `shipping_address`, `tracking_number`, `shipped_at`, `delivered_at`).

**GET /v1/admin/orders** (Admin)

- **Query:** Same `limit` / `offset`.
- **Response 200:** Same as me/orders but for all users.

**PATCH /v1/admin/orders/:id/status** (Admin)

- **Params:** `id` – order ID.
- **Body:**
  - `status` (required): `"PROCESSING"` | `"SHIPPED"` | `"DELIVERED"`.
  - `tracking_number` (optional) – e.g. for SHIPPED.
- **Response 200:** `{ "id", "user_id", "old_status", "new_status" }`.
- **400/404:** Invalid transition or order not found.

**POST /v1/orders/:id/pay** (User)

- Marks order as PAID without Razorpay (e.g. “pay on delivery” or manual).
- **Response 200:** Status update result. **404:** Order not found. **400:** Invalid transition.

**POST /v1/orders/:id/cancel** (User)

- Cancels order (CREATED → CANCELLED) and restores inventory.
- **Body:** Can be empty `{}`.
- **Response 200:** Update result. **404/400:** Not found or invalid transition.

**POST /v1/orders/:id/payment** (User) – Razorpay create order

- Creates a Razorpay order for the given app order. Frontend uses this to open Razorpay Checkout.
- **Response 200:**
  - `razorpay_order_id`, `key_id`, `amount`, `currency`, `receipt`
- **400:** Order not in CREATED or not found. **503:** Payment provider not configured.

**POST /v1/orders/:id/payment/confirm** (User) – Razorpay confirm

- After Razorpay success, frontend sends the payment IDs and signature for verification.
- **Body:**
  - `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` (all required).
- **Response 200:** Order status update result.
- **400:** Invalid signature or already processed.

---

### 3.7 Webhooks (backend-to-backend)

| Method | Path                    | Auth | Description           |
|--------|-------------------------|------|------------------------|
| POST   | `/v1/webhooks/razorpay` | Razorpay signature | Razorpay payment/order events. |

Not called by the frontend; backend receives Razorpay events (e.g. `payment.captured`) and marks orders PAID.

---

### 3.8 Cache (optional / dev)

| Method | Path                | Auth | Description      |
|--------|---------------------|------|------------------|
| GET    | `/v1/cache/test`    | No   | Test cache read/write. |
| GET    | `/v1/cache/stats`   | No   | Cache type and status. |

**GET /v1/cache/test**  
Returns cache_type, redis_status, test_key, cached_value, cache_working.

**GET /v1/cache/stats**  
Returns cache_type, redis_url, cache_available, cache_working, note.

---

## 4. Data Models (for UI / types)

### User (exposed to frontend)

- `id`: number  
- `email`: string  
- `role`: `"USER"` | `"ADMIN"`  
- `created_at`: string (optional, e.g. on GET /users/:id)

### Product

- `id`: number  
- `name`: string  
- `price_cents`: number  
- `active`: boolean  
- `created_at`: string  

### Order

- `id`: number  
- `user_id`: number  
- `status`: `"CREATED"` | `"PAID"` | `"PROCESSING"` | `"SHIPPED"` | `"DELIVERED"` | `"CANCELLED"`  
- `total_cents`: number  
- `created_at`: string  
- `shipping_address`: string | null  
- `tracking_number`: string | null  
- `shipped_at`: string | null  
- `delivered_at`: string | null  
- `razorpay_order_id`: string | null  
- `razorpay_payment_id`: string | null  
- `items` (when single order fetched): array of `{ id, product_id, quantity, price_cents }`

### Order item (inside order)

- `id`: number  
- `product_id`: number  
- `quantity`: number  
- `price_cents`: number  

---

## 5. Frontend Flow Summary

1. **Auth:** Sign up or sign in → store `token` and optionally `user` (id, email, role). Send `Authorization: Bearer <token>` on every protected request.
2. **Products:** GET `/v1/products` to show catalog (no auth). Admin: POST `/v1/products` to create.
3. **Orders:**
   - Create: POST `/v1/orders` with `Idempotency-Key` and body `product_id`, `quantity`, optional `shipping_address`.
   - List: GET `/v1/me/orders` for current user; GET `/v1/admin/orders` for admin.
   - Detail: GET `/v1/orders/:id`.
   - Pay via Razorpay: POST `/v1/orders/:id/payment` → get `razorpay_order_id` and `key_id` → open Razorpay Checkout on client → on success POST `/v1/orders/:id/payment/confirm` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
   - Cancel: POST `/v1/orders/:id/cancel`.
4. **Admin:** PATCH `/v1/admin/orders/:id/status` for shipping status; POST `/v1/inventory/:productId/add` or `remove` for stock.

---

## 6. Environment (for reference)

Backend uses (frontend does not need to set these; they’re for running the server):

- `PORT`, `HOST` – server bind.
- `JWT_SECRET` – signing key for JWTs.
- `ADMIN_REGISTRATION_SECRET` – optional; if set, sign-up with this value creates ADMIN.
- `REDIS_URL` – optional; if set, cache uses Redis.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` – for payments (Razorpay dashboard).
- DB: PostgreSQL (connection via env used in pool).

---

## 7. Error Responses

- **400** – Bad request: `{ "error": "message" }`.
- **401** – Unauthorized: `{ "error": "Unauthorized" }`.
- **403** – Forbidden: `{ "error": "Forbidden: Admin access required" }` or invalid admin secret.
- **404** – Not found: `{ "error": "..." }`.
- **409** – Conflict: e.g. user already exists, product name exists.
- **500** – Server error: `{ "error": "..." }`.

Use this document as the single source of truth for building the frontend against the Ingress API.

---

## 8. TypeScript types (optional)

```ts
// Auth
export type Role = 'USER' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// User (GET /users/:id)
export interface User {
  id: number;
  email: string;
  created_at: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  price_cents: number;
  active: boolean;
  created_at: string;
}

// Order status
export type OrderStatus =
  | 'CREATED'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_cents: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  shipping_address: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  items?: OrderItem[];
}

// Create order response
export interface CreateOrderResponse {
  order_id: number;
}

// Razorpay create payment response
export interface CreatePaymentResponse {
  razorpay_order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  receipt: string;
}

// Error response (all error codes)
export interface ErrorResponse {
  error: string;
}
```
