-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- form_templates table
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  questions_json JSONB NOT NULL,
  pdf_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  pdf_generating BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) NOT NULL,
  -- 基本情報
  name VARCHAR(255),
  sex VARCHAR(10),
  birth_year INTEGER,
  birth_month INTEGER,
  birth_day INTEGER,
  phone VARCHAR(50),
  address TEXT,
  has_insurance BOOLEAN,
  nationality VARCHAR(100),
  -- 症状
  symptoms JSONB,
  symptom_other TEXT,
  -- アレルギー
  has_allergy BOOLEAN,
  allergy_types JSONB,
  allergy_other TEXT,
  -- 服薬
  is_medicating BOOLEAN,
  medication_detail TEXT,
  -- 麻酔・抜歯・妊娠・授乳
  anesthesia_trouble BOOLEAN,
  has_extraction BOOLEAN,
  is_pregnant BOOLEAN,
  pregnancy_months INTEGER,
  is_lactating BOOLEAN,
  -- 既往歴
  past_diseases JSONB,
  disease_other TEXT,
  has_under_treatment BOOLEAN,
  disease_under_treatment_detail TEXT,
  -- 治療希望
  treatment_preferences JSONB,
  treatment_other TEXT,
  -- 通訳
  can_bring_interpreter BOOLEAN,
  -- メタデータ
  visit_year INTEGER,
  visit_month INTEGER,
  visit_day INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_questionnaires_tenant_id ON questionnaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_created_at ON questionnaires(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_tenant_id ON password_reset_tokens(tenant_id);
