# Vercelデプロイ手順

## 前提条件

1. Vercelアカウント（[https://vercel.com](https://vercel.com)）
2. GitHubアカウント（またはGitリポジトリ）
3. Supabaseプロジェクト

## ステップ1: リポジトリの準備

1. プロジェクトをGitリポジトリにコミット・プッシュ
2. GitHubにリポジトリを作成（または既存のリポジトリを使用）

## ステップ2: Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択（またはインポート）
4. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

## ステップ3: 環境変数の設定

Vercelダッシュボードの「Settings」→「Environment Variables」で以下を設定：

### 必須環境変数

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
INTERNAL_API_TOKEN=your_random_secure_token
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
JWT_SECRET=your_random_secure_token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 環境変数の生成方法

- `INTERNAL_API_TOKEN`: ランダムな文字列（例: `openssl rand -hex 32`）
- `JWT_SECRET`: ランダムな文字列（例: `openssl rand -hex 32`）
- `NEXT_PUBLIC_APP_URL`: デプロイ後のVercel URL（例: `https://your-app.vercel.app`）

### 環境ごとの設定

- **Production**: 本番環境用の値
- **Preview**: プレビュー環境用の値（任意）
- **Development**: 開発環境用の値（任意）

## ステップ4: Supabaseの設定

### 4.1 データベースマイグレーション

1. Supabase Dashboard → SQL Editor
2. 以下のマイグレーションファイルを順番に実行：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_create_standard_template.sql`

### 4.2 Storageバケットの作成

1. Supabase Dashboard → Storage
2. 「Create a new bucket」をクリック
3. 設定：
   - **Name**: `pdfs`
   - **Public bucket**: はい（PDFを公開する場合）またはいいえ（認証が必要な場合）
4. 「Create bucket」をクリック

### 4.3 標準テンプレートの登録

標準テンプレートの`questions_json`と`pdf_html`を設定する必要があります。
SupabaseのSQL Editorで実行するか、`scripts/seed-standard-template.ts`を実行してください。

## ステップ5: デプロイ

1. Vercelダッシュボードで「Deploy」をクリック
2. ビルドログを確認
3. デプロイが完了したら、URLが表示されます

## ステップ6: デプロイ後の確認

### 6.1 動作確認

1. デプロイされたURLにアクセス
2. 管理画面ログイン（`/admin/login`）が動作するか確認
3. 問診票入力（`/clinic/[slug]`）が動作するか確認

### 6.2 エラーの確認

- Vercel Dashboard → Functions でログを確認
- Supabase Dashboard → Logs でデータベースエラーを確認

## トラブルシューティング

### Puppeteerのエラー

Vercelのサーバーレス関数では、Puppeteerの実行時間が60秒に制限されています。
`vercel.json`で設定済みですが、PDF生成がタイムアウトする場合は：

1. PDF生成の処理を最適化
2. より軽量なPDF生成ライブラリを検討

### 環境変数のエラー

環境変数が正しく設定されていない場合：

1. Vercel Dashboard → Settings → Environment Variables で確認
2. 再デプロイを実行

### Supabase接続エラー

1. Supabase Dashboard → Settings → API でURLとキーを確認
2. 環境変数が正しく設定されているか確認
3. Supabaseのネットワーク設定を確認（IP制限など）

## 本番環境の最適化

### 1. カスタムドメインの設定

1. Vercel Dashboard → Settings → Domains
2. カスタムドメインを追加
3. DNS設定を更新

### 2. 環境変数の更新

カスタムドメインを使用する場合、`NEXT_PUBLIC_APP_URL`を更新してください。

### 3. セキュリティ設定

- `INTERNAL_API_TOKEN`と`JWT_SECRET`は強力なランダム文字列を使用
- SupabaseのRow Level Security (RLS)を有効化（必要に応じて）
- レート制限の設定を検討

## 継続的デプロイ

GitHubリポジトリと連携している場合：

- `main`ブランチへのプッシュで自動的に本番環境にデプロイ
- プルリクエストでプレビュー環境が自動生成

## サポート

問題が発生した場合：

1. Vercel Dashboard → Functions でログを確認
2. Supabase Dashboard → Logs でエラーを確認
3. ブラウザの開発者ツールでコンソールエラーを確認
