-- 1) สร้าง SCHEMA (ถ้ายังไม่มี)
CREATE SCHEMA IF NOT EXISTS microplates;

-- 2) สร้างตาราง users ครั้งแรก (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS microplates.users (
  id SERIAL PRIMARY KEY,
  -- ถ้าเพิ่งสร้างใหม่ ก็ใช้ NOT NULL+UNIQUE ได้เลย
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) ถ้าตาราง users มีอยู่แล้ว แต่ไม่มีคอลัมน์ email ให้เพิ่มขึ้นมา
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'microplates'
       AND table_name   = 'users'
       AND column_name  = 'email'
  ) THEN
    ALTER TABLE microplates.users
      ADD COLUMN email VARCHAR(255);

    -- back-fill ค่า email สำหรับแถวเก่า (ปรับให้เหมาะกับข้อมูลจริง)
    UPDATE microplates.users
       SET email = 'user' || id || '@example.com'
     WHERE email IS NULL;

    -- เรียกใช้ constraint NOT NULL และ UNIQUE
    ALTER TABLE microplates.users
      ALTER COLUMN email SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_users_email
      ON microplates.users(email);
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 4) สร้าง (หรือปรับ) trigger function สำหรับ updated_at
CREATE OR REPLACE FUNCTION microplates.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at
  ON microplates.users;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON microplates.users
  FOR EACH ROW
  EXECUTE FUNCTION microplates.set_updated_at();


-- 5) สร้างตาราง refresh_tokens (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS microplates.refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL
    REFERENCES microplates.users(id)
    ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6) สร้าง indexes สำหรับ refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
  ON microplates.refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
  ON microplates.refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked
  ON microplates.refresh_tokens(revoked);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active
  ON microplates.refresh_tokens(expires_at)
  WHERE revoked = FALSE;
