-- Add admin email and password hash to clinic_settings table
-- This allows each clinic to have its own administrator

ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Create index for faster lookups by admin email
CREATE INDEX IF NOT EXISTS idx_clinic_settings_admin_email ON clinic_settings(admin_email);

-- Add comment
COMMENT ON COLUMN clinic_settings.admin_email IS 'Administrator email address for this clinic';
COMMENT ON COLUMN clinic_settings.admin_password_hash IS 'Bcrypt hash of administrator password';
