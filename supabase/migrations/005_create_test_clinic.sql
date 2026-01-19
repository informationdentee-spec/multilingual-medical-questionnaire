-- Create test clinic for admin login
-- This migration creates a test tenant with the following credentials:
-- Email: test@example.com
-- Password: test1234
-- Slug: test

-- Note: The password hash below is for 'test1234' (bcrypt rounds=10)
-- In production, use a stronger password and generate a new hash

INSERT INTO tenants (name, slug, email, password_hash, template_id)
VALUES (
  'テストクリニック',
  'test',
  'test@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- Create clinic settings for test clinic
INSERT INTO clinic_settings (clinic_id, printer_email)
VALUES ('test', NULL)
ON CONFLICT (clinic_id) DO NOTHING;
