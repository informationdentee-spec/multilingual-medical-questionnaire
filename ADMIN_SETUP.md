# 管理画面セットアップガイド

## テスト用クリニックの作成

管理画面にログインするには、まずテスト用のクリニック（テナント）をデータベースに作成する必要があります。

### 方法1: Node.jsスクリプトを使用（推奨）

1. **環境変数を確認**
   - `.env.local` に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が設定されていることを確認

2. **スクリプトを実行**
   ```bash
   npx ts-node scripts/create-test-clinic.ts
   ```

3. **ログイン情報**
   - URL: `https://multilingual-medical-questionnaire.vercel.app/admin/login`
   - Email: `test@example.com`
   - Password: `test1234`

### 方法2: Supabase SQL Editorで直接作成

1. **Supabase Dashboardにアクセス**
   - https://app.supabase.com にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」をクリック

3. **以下のSQLを実行**

```sql
-- パスワード: test1234 のハッシュを生成
-- 注意: 実際のパスワードハッシュは bcrypt で生成する必要があります
-- 以下のハッシュは 'test1234' のハッシュです（bcrypt rounds=10）

INSERT INTO tenants (name, slug, email, password_hash, template_id)
VALUES (
  'テストクリニック',
  'test',
  'test@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- クリニック設定も作成
INSERT INTO clinic_settings (clinic_id, printer_email)
VALUES ('test', NULL)
ON CONFLICT (clinic_id) DO NOTHING;
```

4. **パスワードハッシュの生成方法**

Node.jsでパスワードハッシュを生成する場合：

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('test1234', 10);
console.log(hash);
```

または、以下のコマンドで生成：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log(h));"
```

### 方法3: APIエンドポイントを使用（開発用）

テスト用のAPIエンドポイントを作成することもできますが、セキュリティ上の理由から本番環境では推奨しません。

## ログイン後の確認事項

1. **ダッシュボード** (`/admin`)
   - 統計情報が表示されることを確認

2. **問診票一覧** (`/admin/questionnaires`)
   - 保存された問診票が表示されることを確認

3. **クリニック設定** (`/admin/settings`)
   - プリンターメールアドレスを設定できることを確認

## トラブルシューティング

### ログイン画面が表示されない

- Vercelのデプロイが完了しているか確認
- ブラウザのコンソールでエラーを確認
- Vercelのログを確認

### ログインできない

- テナントがデータベースに存在するか確認：
  ```sql
  SELECT * FROM tenants WHERE email = 'test@example.com';
  ```
- パスワードハッシュが正しいか確認
- ブラウザのCookieが有効か確認

### 認証エラーが発生する

- JWT_SECRET環境変数が設定されているか確認
- Cookieの設定が正しいか確認（secure, httpOnly, sameSite）

## 本番環境での注意事項

1. **パスワードの変更**
   - テスト用のパスワード（`test1234`）は本番環境では使用しないでください
   - 強力なパスワードに変更してください

2. **セキュリティ**
   - 本番環境では、テスト用アカウントを削除するか、強力なパスワードに変更してください
   - 定期的にパスワードを変更してください

3. **メールアドレス**
   - テスト用のメールアドレス（`test@example.com`）は本番環境では使用しないでください
