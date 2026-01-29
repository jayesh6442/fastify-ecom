-- Shipping, delivery and Razorpay fields for orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Extend order status: CREATED -> PAID -> PROCESSING -> SHIPPED -> DELIVERED (and CANCELLED from CREATED)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('CREATED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
