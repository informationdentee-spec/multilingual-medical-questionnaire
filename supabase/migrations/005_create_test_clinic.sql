-- Create test clinic for admin login
-- This migration creates a test tenant with the following credentials:
-- Email: test@example.com
-- Password: test1234
-- Slug: test

-- Note: The password hash below is for 'test1234' (bcrypt rounds=10)
-- In production, use a stronger password and generate a new hash
-- To generate a new hash, run: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(h => console.log(h));"

INSERT INTO tenants (name, slug, email, password_hash, template_id)
VALUES (
  'テストクリニック',
  'test',
  'test@example.com',
  '$2b$10$lnavnIC6YJwA43CwnInnCuSZgo7l37nZt2JGN549.gQKXm9W9043O',
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
