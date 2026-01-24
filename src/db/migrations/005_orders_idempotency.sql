ALTER TABLE
    orders
ADD
    COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX orders_idempotency_key_uq ON orders (idempotency_key)
WHERE
    idempotency_key IS NOT NULL;