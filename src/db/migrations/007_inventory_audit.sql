CREATE TABLE IF NOT EXISTS inventory_audit (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('ADD', 'REMOVE', 'ORDER', 'CANCEL')),
    quantity_change INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inventory_audit_product_id_idx ON inventory_audit (product_id);
CREATE INDEX inventory_audit_created_at_idx ON inventory_audit (created_at);
