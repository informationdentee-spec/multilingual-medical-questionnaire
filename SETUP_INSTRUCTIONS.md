# セットアップ手順

## 1. マイグレーション実行: Supabaseでマイグレーションファイルを実行

### 手順

#### 方法1: Supabase Dashboard（推奨）

1. **Supabase Dashboardにログイン**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」をクリック

3. **マイグレーションファイルの内容を実行**
   - 以下のSQLをコピー＆ペーストして実行：

```sql
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
```

4. **実行ボタンをクリック**
   - 「Run」ボタンをクリックして実行
   - 成功メッセージが表示されることを確認

#### 方法2: Supabase CLI（開発環境）

```bash
# Supabase CLIがインストールされている場合
supabase db push
```

### 確認方法

以下のSQLでテーブルが作成されたことを確認：

```sql
SELECT * FROM clinic_settings;
```

空の結果が返れば、テーブルは正常に作成されています。

---

## 2. メールアドレスの検証: APIは基本的なメール形式の検証を行います

### 現在の実装

現在、`/api/clinic-settings` のPOSTエンドポイントでは、以下の正規表現でメールアドレスを検証しています：

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### 検証内容

- ✅ 基本的なメール形式（`user@domain.com`）
- ✅ `@` 記号の存在
- ✅ ドメイン部分に `.` が含まれる
- ❌ ドメインの詳細な検証（TLD、MXレコードなど）は行わない

### 改善案（オプション）

より厳密な検証が必要な場合は、以下のライブラリを使用できます：

```bash
npm install validator
```

```typescript
import validator from 'validator';

if (!validator.isEmail(printer_email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  );
}
```

**注意**: 現在の実装で十分な場合は、追加の改善は不要です。

---

## 3. セキュリティ: 本番環境では、設定管理APIに認証を追加することを推奨します

### 現在の状態

`/api/clinic-settings` は現在、認証なしでアクセス可能です。本番環境では、以下の認証を追加してください。

### 実装手順

#### ステップ1: 認証ミドルウェアの確認

既存の認証システムを確認：
- `lib/middleware/auth.ts` に `requireAuth` 関数が実装済み
- JWTトークンベースの認証が使用されている

#### ステップ2: `/api/clinic-settings/route.ts` に認証を追加

以下のように修正：

```typescript
import { getAuthenticatedTenant } from '@/lib/middleware/auth';

// POST と DELETE メソッドに認証を追加
export async function POST(request: NextRequest) {
  // 認証チェック
  const tenantId = await getAuthenticatedTenant(request);
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 既存の処理...
}

export async function DELETE(request: NextRequest) {
  // 認証チェック
  const tenantId = await getAuthenticatedTenant(request);
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 既存の処理...
}
```

#### ステップ3: 認証が必要な理由

- **POST**: クリニック設定の作成・更新は管理者のみが実行可能にする
- **DELETE**: クリニック設定の削除は管理者のみが実行可能にする
- **GET**: 読み取りのみのため、認証は任意（必要に応じて追加）

### 認証のテスト方法

#### 認証なしでアクセス（エラーになることを確認）

```bash
curl -X POST https://your-app.vercel.app/api/clinic-settings \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": "test",
    "printer_email": "printer@example.com"
  }'
```

期待されるレスポンス：
```json
{
  "error": "Unauthorized"
}
```

#### 認証ありでアクセス

1. **ログインしてトークンを取得**
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password"
     }'
   ```

2. **Cookieにトークンが設定されるので、ブラウザでアクセス**
   - または、PostmanなどのツールでCookieを設定

### 代替案: APIキー認証

JWT認証の代わりに、APIキーを使用する場合：

```typescript
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.CLINIC_SETTINGS_API_KEY;
  
  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 既存の処理...
}
```

環境変数に設定：
```
CLINIC_SETTINGS_API_KEY=your-secret-api-key-here
```

---

## まとめ

### 必須作業

1. ✅ **マイグレーション実行**: Supabase DashboardでSQLを実行
2. ⚠️ **認証の追加**: 本番環境では必須（開発環境では任意）

### 推奨作業

3. 📧 **メール検証の改善**: 必要に応じてより厳密な検証を追加

### 優先順位

1. **高**: マイグレーション実行（機能を使用するために必須）
2. **高**: 認証の追加（本番環境のセキュリティのため必須）
3. **中**: メール検証の改善（現在の実装で十分な場合は任意）
