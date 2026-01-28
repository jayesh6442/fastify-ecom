-- Add unique constraint on product name to prevent duplicates
ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE (name);
