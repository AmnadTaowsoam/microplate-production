-- สร้าง SCHEMA
CREATE SCHEMA IF NOT EXISTS microplates;

-- 1. Users (Auth & User Profile)
CREATE TABLE microplates.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger function เพื่ออัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION microplates.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ที่ผูกกับทุก UPDATE ของ users
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON microplates.users
FOR EACH ROW
EXECUTE FUNCTION microplates.set_updated_at();

-- 2. Refresh Tokens (for JWT refresh flow)
CREATE TABLE microplates.refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES microplates.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes เสริมเพื่อประสิทธิภาพการค้นหา
CREATE INDEX idx_refresh_tokens_user_id ON microplates.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON microplates.refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON microplates.refresh_tokens(revoked);
CREATE INDEX idx_refresh_tokens_active ON microplates.refresh_tokens(expires_at) WHERE revoked = FALSE;
