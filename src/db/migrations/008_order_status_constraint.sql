-- Add constraint to ensure valid order statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('CREATED', 'PAID', 'CANCELLED'));
