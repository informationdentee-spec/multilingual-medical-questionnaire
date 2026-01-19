-- Remove tenant requirement from questionnaires table
-- This migration makes tenant_id and template_id nullable to support the new architecture
-- where tenant concept is not used

-- Drop the existing foreign key constraint
ALTER TABLE questionnaires 
  DROP CONSTRAINT IF EXISTS questionnaires_tenant_id_fkey;

-- Make tenant_id nullable
ALTER TABLE questionnaires 
  ALTER COLUMN tenant_id DROP NOT NULL;

-- Re-add the foreign key constraint (now allowing null values)
ALTER TABLE questionnaires 
  ADD CONSTRAINT questionnaires_tenant_id_fkey 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
