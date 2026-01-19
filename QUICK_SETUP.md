# クイックセットアップガイド

`clinic_settings`テーブルが存在しない場合の、完全なセットアップ手順です。

## エラーが出た場合の対処法

エラー: `relation "clinic_settings" does not exist`

このエラーは、`clinic_settings`テーブルがまだ作成されていないことを意味します。

## 解決方法

### ステップ1: テーブルを作成

Supabase SQL Editorで、以下のSQLを**最初に実行**してください：

```sql
-- Create clinic_settings table to store clinic-specific settings
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
```

**実行後、「Success」と表示されれば成功です。**

### ステップ2: 管理者情報カラムを追加

テーブルが作成されたら、以下のSQLを実行してください：

```sql
-- clinic_settingsテーブルに管理者情報のカラムを追加
ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- 管理者メールアドレスで検索しやすくするためのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_clinic_settings_admin_email ON clinic_settings(admin_email);

-- Add comments
COMMENT ON COLUMN clinic_settings.admin_email IS 'Administrator email address for this clinic';
COMMENT ON COLUMN clinic_settings.admin_password_hash IS 'Bcrypt hash of administrator password';
```

**実行後、「Success」と表示されれば成功です。**

### ステップ3: 確認

テーブルが正しく作成されたか確認：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinic_settings';
```

以下のカラムが表示されれば成功：
- `id`
- `clinic_id`
- `printer_email`
- `created_at`
- `updated_at`
- `admin_email` ← 新しく追加
- `admin_password_hash` ← 新しく追加

---

## 次のステップ

テーブルとカラムの作成が完了したら、`CLINIC_ADMIN_SETUP.md`の「ステップ2: パスワードハッシュの生成」から続けてください。
