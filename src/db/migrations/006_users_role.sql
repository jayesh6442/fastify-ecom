ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'));

CREATE INDEX users_role_idx ON users (role);
