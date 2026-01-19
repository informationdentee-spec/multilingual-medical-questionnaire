# 多言語歯科問診票アプリ

Next.js 14 + Supabase + TypeScriptで構築された、23言語対応のスマホ向け歯科問診票アプリです。

## 機能

- 23言語対応の問診票入力
- クリニックごとのデータ分離
- PDF生成・プレビュー・印刷機能
- 管理画面（メール+パスワード認証）
- パスワード再設定機能

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **PDF生成**: Puppeteer
- **i18n**: next-intl
- **UI**: React Hook Form + Zod

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Internal API Token
INTERNAL_API_TOKEN=your_internal_api_token

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# JWT Secret
JWT_SECRET=your_jwt_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseのセットアップ

1. Supabaseプロジェクトを作成
2. SQL Editorでマイグレーションファイルを実行：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_create_standard_template.sql`
3. Storageバケットを作成：
   - バケット名: `pdfs`
   - 公開バケット: はい（必要に応じて）

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択（またはGitリポジトリをインポート）
4. プロジェクト設定：
   - Framework Preset: Next.js（自動検出）
   - Root Directory: `./`（デフォルト）
   - Build Command: `npm run build`（デフォルト）
   - Output Directory: `.next`（デフォルト）

### 2. 環境変数の設定

Vercelダッシュボードの「Settings」→「Environment Variables」で以下の環境変数を設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_API_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`（本番環境のURL、例: `https://your-app.vercel.app`）

### 3. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始します。

### 4. 注意事項

- **Puppeteer**: Vercelのサーバーレス関数では、Puppeteerの実行時間が60秒に制限されています（`vercel.json`で設定済み）
- **Supabase Storage**: PDFファイルを保存するために、Supabase Storageバケット（`pdfs`）を作成してください
- **環境変数**: 本番環境と開発環境で異なる環境変数を使用する場合は、Vercelダッシュボードで環境ごとに設定できます

## データベースマイグレーション

本番環境にデプロイ後、SupabaseのSQL Editorでマイグレーションファイルを実行してください：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_create_standard_template.sql`

## 標準テンプレートの登録

標準テンプレートを登録するには、SupabaseのSQL Editorで以下を実行：

```sql
-- 標準テンプレートのquestions_jsonとpdf_htmlを設定
-- （実際の内容はscripts/seed-standard-template.tsを参照）
```

または、Node.jsスクリプトを実行：

```bash
# 環境変数を設定してから実行
npx ts-node scripts/seed-standard-template.ts
```

## テストクリニックの作成

管理画面にログインするには、テスト用のクリニック（テナント）を作成する必要があります。

### 方法1: マイグレーションファイルを実行（推奨）

SupabaseのSQL Editorで以下を実行：

```sql
-- supabase/migrations/005_create_test_clinic.sql の内容を実行
```

または、以下のSQLを直接実行：

```sql
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

INSERT INTO clinic_settings (clinic_id, printer_email)
VALUES ('test', NULL)
ON CONFLICT (clinic_id) DO NOTHING;
```

### 方法2: Node.jsスクリプトを使用

```bash
npx ts-node scripts/create-test-clinic.ts
```

### ログイン情報

- **URL**: `https://multilingual-medical-questionnaire.vercel.app/admin/login`
- **Email**: `test@example.com`
- **Password**: `test1234`

**注意**: 本番環境では、テスト用のパスワードを変更してください。

詳細は `ADMIN_SETUP.md` を参照してください。

## ライセンス

MIT
