# クリニック管理者セットアップガイド

このガイドでは、各クリニックごとに管理者を設定する手順を説明します。

## 📋 前提条件

- Supabaseプロジェクトにアクセスできること
- 各クリニックの`clinic_id`が分かっていること（例: `test`, `clinic1`, `clinic2`など）

---

## ステップ1: データベースマイグレーションの実行

### 1-1. Supabase Dashboardにアクセス

1. ブラウザで https://app.supabase.com を開く
2. ログインする
3. プロジェクトを選択

### 1-2. SQL Editorを開く

1. 左メニューから「**SQL Editor**」をクリック
2. 「**New query**」ボタンをクリック

### 1-3. マイグレーションSQLを実行

**重要：まず`clinic_settings`テーブルが存在するか確認してください。**

#### ステップ1: テーブルの存在確認

以下のSQLを実行して、テーブルが存在するか確認：

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'clinic_settings'
);
```

- `true`が返ればテーブルは存在します → **ステップ2に進んでください**
- `false`が返ればテーブルが存在しません → **ステップ1-Aを実行してください**

#### ステップ1-A: テーブルが存在しない場合（テーブルを作成）

以下のSQLをコピー＆ペーストして実行：

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

「**Run**」ボタンをクリックして実行します。

#### ステップ2: 管理者情報カラムの追加

テーブルが存在することを確認したら、以下のSQLをコピー＆ペーストして実行：

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

「**Run**」ボタン（または `Ctrl+Enter`）をクリック
「Success. No rows returned」と表示されれば成功

---

## ステップ2: パスワードハッシュの生成

管理者のパスワードを安全に保存するため、パスワードをハッシュ化します。

### 方法A: Node.jsコマンドで生成（推奨）

プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('あなたのパスワード', 10).then(h => console.log(h));"
```

**例：パスワードが `test1234` の場合**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log(h));"
```

実行すると、以下のような長い文字列が表示されます：
```
$2b$10$lnavnIC6YJwA43CwnInnCuSZgo7l37nZt2JGN549.gQKXm9W9043O
```

**この文字列をコピーしておいてください。** これがパスワードハッシュです。

### 方法B: 一時的なNode.jsスクリプトで生成

1. プロジェクトのルートディレクトリに `generate-password-hash.js` というファイルを作成
2. 以下の内容を記述：

```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'test1234'; // ここに設定したいパスワードを入力
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
```

3. ターミナルで実行：
```bash
node generate-password-hash.js
```

4. 表示されたハッシュをコピー

---

## ステップ3: 管理者情報の設定

各クリニックの管理者情報をデータベースに設定します。

### 3-1. 既存のクリニック設定を確認

まず、どのクリニックが存在するか確認します。

Supabase SQL Editorで以下を実行：

```sql
SELECT clinic_id FROM clinic_settings;
```

### 3-2. 管理者情報を設定

**例：`test`というクリニックに管理者を設定する場合**

```sql
-- パスワード: test1234 のハッシュを使用（ステップ2で生成したハッシュに置き換えてください）
UPDATE clinic_settings
SET 
  admin_email = 'admin@test-clinic.com',
  admin_password_hash = '$2b$10$lnavnIC6YJwA43CwnInnCuSZgo7l37nZt2JGN549.gQKXm9W9043O'
WHERE clinic_id = 'test';
```

**重要：**
- `admin_email`: 管理者のメールアドレス（各クリニックごとに異なるメールアドレスを設定）
- `admin_password_hash`: ステップ2で生成したパスワードハッシュ
- `clinic_id`: 設定したいクリニックのID

### 3-3. クリニック設定が存在しない場合

もし`clinic_settings`に該当するクリニックが存在しない場合は、新規作成します：

```sql
INSERT INTO clinic_settings (clinic_id, admin_email, admin_password_hash)
VALUES (
  'test',  -- クリニックID
  'admin@test-clinic.com',  -- 管理者メールアドレス
  '$2b$10$lnavnIC6YJwA43CwnInnCuSZgo7l37nZt2JGN549.gQKXm9W9043O'  -- パスワードハッシュ
);
```

### 3-4. 設定の確認

設定が正しく保存されたか確認：

```sql
SELECT clinic_id, admin_email, admin_password_hash IS NOT NULL as has_password
FROM clinic_settings
WHERE clinic_id = 'test';
```

`admin_email`が表示され、`has_password`が`true`になっていれば成功です。

---

## ステップ4: ログインの確認

### 4-1. アプリケーションにアクセス

1. ブラウザで管理画面のログインページを開く
   - 例: `https://multilingual-medical-questionnaire.vercel.app/admin/login`

### 4-2. ログインを試行

1. **メールアドレス**: ステップ3で設定した`admin_email`を入力
   - 例: `admin@test-clinic.com`

2. **パスワード**: ステップ2でハッシュ化した元のパスワードを入力
   - 例: `test1234`

3. 「ログイン」ボタンをクリック

### 4-3. ログイン成功の確認

- ログインが成功すると、管理ダッシュボードにリダイレクトされます
- エラーメッセージが表示された場合は、以下を確認：
  - メールアドレスが正しいか
  - パスワードが正しいか
  - データベースに正しく設定されているか

---

## ステップ5: 動作確認

### 5-1. 自分のクリニックのデータのみ表示されることを確認

ログイン後、以下のページで自分のクリニックのデータのみが表示されることを確認：

1. **統計情報ページ** (`/admin`)
   - 自分のクリニックの問診票数が表示される
   - 他のクリニックのデータは表示されない

2. **問診票一覧ページ** (`/admin/questionnaires`)
   - 自分のクリニックの問診票のみが表示される

3. **問診票詳細ページ**
   - 自分のクリニックの問診票のみアクセス可能

### 5-2. 他のクリニックのデータにアクセスできないことを確認

1. ブラウザの開発者ツール（F12）を開く
2. ネットワークタブでAPIリクエストを確認
3. `/api/questionnaire-responses/list`などのAPIリクエストを確認
4. レスポンスに自分の`clinic_id`のデータのみが含まれていることを確認

---

## 📝 複数のクリニックを設定する場合

複数のクリニックに管理者を設定する場合は、ステップ3を各クリニックごとに繰り返します。

**例：3つのクリニックを設定する場合**

```sql
-- クリニック1
UPDATE clinic_settings
SET 
  admin_email = 'admin1@clinic1.com',
  admin_password_hash = '$2b$10$...（クリニック1のパスワードハッシュ）'
WHERE clinic_id = 'clinic1';

-- クリニック2
UPDATE clinic_settings
SET 
  admin_email = 'admin2@clinic2.com',
  admin_password_hash = '$2b$10$...（クリニック2のパスワードハッシュ）'
WHERE clinic_id = 'clinic2';

-- クリニック3
UPDATE clinic_settings
SET 
  admin_email = 'admin3@clinic3.com',
  admin_password_hash = '$2b$10$...（クリニック3のパスワードハッシュ）'
WHERE clinic_id = 'clinic3';
```

---

## ⚠️ 注意事項

### パスワードハッシュについて

- **必ずbcrypt（rounds=10）で生成してください**
- パスワードハッシュは元のパスワードから復元できません
- パスワードを忘れた場合は、新しいハッシュを生成して更新する必要があります

### セキュリティについて

- 各クリニックごとに**異なるメールアドレス**を設定してください
- パスワードは**強力なもの**を使用してください（最低8文字以上、大文字・小文字・数字・記号を含む）
- 本番環境では、テスト用のパスワード（`test1234`など）は使用しないでください

### データアクセスについて

- 認証されたユーザーは**自分の`clinic_id`のデータのみ**にアクセス可能です
- 他のクリニックのデータにはアクセスできません
- これは自動的に制御されるため、特別な設定は不要です

---

## 🔧 トラブルシューティング

### ログインできない場合

1. **メールアドレスが正しいか確認**
   ```sql
   SELECT clinic_id, admin_email FROM clinic_settings WHERE clinic_id = 'test';
   ```

2. **パスワードハッシュが正しく設定されているか確認**
   ```sql
   SELECT clinic_id, admin_email, admin_password_hash IS NOT NULL as has_password
   FROM clinic_settings WHERE clinic_id = 'test';
   ```

3. **パスワードハッシュを再生成して更新**
   - ステップ2で新しいハッシュを生成
   - ステップ3でUPDATE文を実行

### データが表示されない場合

1. **自分の`clinic_id`が正しいか確認**
   - ログイン後、ブラウザの開発者ツールでJWTトークンを確認
   - または、`/api/auth/session`にアクセスして`clinic_id`を確認

2. **問診票データが存在するか確認**
   ```sql
   SELECT COUNT(*) FROM questionnaire_responses WHERE clinic_id = 'test';
   ```

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. マイグレーションが正しく実行されたか
2. 管理者情報が正しく設定されたか
3. ブラウザのコンソールにエラーがないか
4. VercelのRuntime Logsにエラーがないか
