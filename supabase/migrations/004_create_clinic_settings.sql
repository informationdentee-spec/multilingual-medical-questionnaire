-- Create clinic_settings table to store clinic-specific settings
-- This table allows each clinic to have its own printer email address
CREATE TABLE IF NOT EXISTS clinic_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id TEXT NOT NULL UNIQUE,
  printer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinic_settings_clinic_id ON clinic_settings(clinic_id);

-- Add comment
COMMENT ON TABLE clinic_settings IS 'Stores clinic-specific settings such as printer email addresses';
