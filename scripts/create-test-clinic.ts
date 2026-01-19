/**
 * テスト用クリニック（テナント）を作成するスクリプト
 * 
 * 使用方法:
 * npx ts-node scripts/create-test-clinic.ts
 * 
 * または、環境変数を設定してから実行:
 * SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npx ts-node scripts/create-test-clinic.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Set them as environment variables or in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestClinic() {
  try {
    // テスト用のパスワード（本番環境では変更してください）
    const password = 'test1234';
    const passwordHash = await bcrypt.hash(password, 10);

    // テストクリニックの情報
    const clinicData = {
      name: 'テストクリニック',
      slug: 'test',
      email: 'test@example.com',
      password_hash: passwordHash,
      template_id: null, // テンプレートは後で設定可能
    };

    console.log('Creating test clinic...');
    console.log('Email: test@example.com');
    console.log('Password: test1234');
    console.log('Slug: test');

    // 既存のテナントをチェック
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id, email, slug')
      .eq('email', clinicData.email)
      .single();

    let tenant;
    let tenantError;

    if (existingTenant) {
      console.log('\n⚠️  Test clinic already exists!');
      console.log('Existing tenant:', existingTenant);
      console.log('Updating password hash...');
      
      // 既存のテナントのパスワードハッシュを更新
      const { data: updatedTenant, error: updateError } = await supabase
        .from('tenants')
        .update({
          password_hash: passwordHash,
          name: clinicData.name,
          slug: clinicData.slug,
        })
        .eq('email', clinicData.email)
        .select()
        .single();
      
      tenant = updatedTenant;
      tenantError = updateError;
    } else {
      // テナントを作成
      const { data: newTenant, error: insertError } = await supabase
        .from('tenants')
        .insert(clinicData)
        .select()
        .single();
      
      tenant = newTenant;
      tenantError = insertError;
    }

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      throw tenantError;
    }

    console.log('\n✅ Test clinic created successfully!');
    console.log('\nLogin credentials:');
    console.log('  URL: https://multilingual-medical-questionnaire.vercel.app/admin/login');
    console.log('  Email: test@example.com');
    console.log('  Password: test1234');
    console.log('\nClinic ID (slug): test');
    console.log('Questionnaire URL: https://multilingual-medical-questionnaire.vercel.app/clinic/test');

    // クリニック設定も作成（オプション）
    const { error: settingsError } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: 'test',
        printer_email: null, // 後で設定可能
      }, {
        onConflict: 'clinic_id',
      });

    if (settingsError) {
      console.warn('⚠️  Could not create clinic settings:', settingsError.message);
    } else {
      console.log('\n✅ Clinic settings created (printer email can be set later)');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestClinic();
