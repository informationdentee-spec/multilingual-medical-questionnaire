# ログイン問題のデバッグ手順

## 確認すべきポイント

### 1. データベースの設定を確認

Supabase SQL Editorで以下を実行して、設定が正しく保存されているか確認：

```sql
-- 管理者情報が正しく設定されているか確認
SELECT 
  clinic_id, 
  admin_email, 
  admin_password_hash IS NOT NULL as has_password,
  LENGTH(admin_password_hash) as hash_length
FROM clinic_settings
WHERE admin_email = 'info@dentee-tech.com';
```

**期待される結果：**
- `clinic_id`: `test`
- `admin_email`: `info@dentee-tech.com`
- `has_password`: `true`
- `hash_length`: `60` (bcryptハッシュは60文字)

### 2. パスワードハッシュが正しいか確認

パスワードハッシュが`test1234`のものか確認するため、新しいハッシュを生成して比較：

```bash
# プロジェクトのルートディレクトリで実行
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log('Hash:', h));"
```

生成されたハッシュが、データベースに保存されているハッシュと一致するか確認してください。

**注意：** ハッシュは毎回異なる値が生成されますが、同じパスワードから生成されたハッシュは検証時に一致します。

### 3. ログイン試行がロックされていないか確認

ログイン試行が多すぎてアカウントがロックされている可能性があります。

**対処法：**
- 数分待ってから再度試行
- または、アプリケーションを再起動（Vercelの場合は再デプロイ）

### 4. ブラウザの開発者ツールでエラーを確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Network」タブを開く
3. ログインを試行
4. `/api/auth/login`のリクエストを確認
5. レスポンスの内容を確認

**確認ポイント：**
- ステータスコード（200なら成功、401なら認証失敗）
- レスポンスボディのエラーメッセージ

### 5. VercelのRuntime Logsを確認

Vercel Dashboardで以下を確認：

1. プロジェクトを選択
2. 「Functions」タブを開く
3. `/api/auth/login`のログを確認
4. エラーメッセージを確認

**確認ポイント：**
- `Login error - clinic admin not found` → メールアドレスが見つからない
- `Login error - password verification failed` → パスワードが間違っている

---

## よくある問題と解決方法

### 問題1: メールアドレスが見つからない

**エラー：** `Login error - clinic admin not found`

**原因：**
- データベースに`admin_email`が設定されていない
- メールアドレスの大文字小文字が一致しない
- スペースが含まれている

**解決方法：**

```sql
-- メールアドレスを確認（大文字小文字、スペースを確認）
SELECT clinic_id, admin_email, TRIM(admin_email) as trimmed_email
FROM clinic_settings
WHERE LOWER(TRIM(admin_email)) = LOWER('info@dentee-tech.com');

-- もし見つからない場合、再設定
UPDATE clinic_settings
SET 
  admin_email = 'info@dentee-tech.com',
  admin_password_hash = '$2b$10$hKot.GF6EN46c27B1Aeztuai3XuTjSznS9VWQiMWPd9kmh1JmTmES'
WHERE clinic_id = 'test';
```

### 問題2: パスワードが間違っている

**エラー：** `Login error - password verification failed`

**原因：**
- パスワードハッシュが正しく生成されていない
- パスワードが間違っている

**解決方法：**

1. 新しいパスワードハッシュを生成：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log(h));"
```

2. 生成されたハッシュでデータベースを更新：

```sql
UPDATE clinic_settings
SET admin_password_hash = '生成されたハッシュ'
WHERE clinic_id = 'test';
```

### 問題3: clinic_idが存在しない

**エラー：** データが見つからない

**原因：**
- `clinic_id = 'test'`のレコードが存在しない

**解決方法：**

```sql
-- clinic_idが存在するか確認
SELECT * FROM clinic_settings WHERE clinic_id = 'test';

-- 存在しない場合は作成
INSERT INTO clinic_settings (clinic_id, admin_email, admin_password_hash)
VALUES (
  'test',
  'info@dentee-tech.com',
  '$2b$10$hKot.GF6EN46c27B1Aeztuai3XuTjSznS9VWQiMWPd9kmh1JmTmES'
);
```

---

## 完全な再設定手順

もし上記の方法で解決しない場合は、以下を実行してください：

### ステップ1: データを確認

```sql
SELECT 
  clinic_id, 
  admin_email, 
  admin_password_hash,
  LENGTH(admin_password_hash) as hash_length
FROM clinic_settings
WHERE clinic_id = 'test';
```

### ステップ2: パスワードハッシュを再生成

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log(h));"
```

### ステップ3: データベースを更新

```sql
UPDATE clinic_settings
SET 
  admin_email = 'info@dentee-tech.com',
  admin_password_hash = 'ステップ2で生成されたハッシュ'
WHERE clinic_id = 'test';
```

### ステップ4: 確認

```sql
SELECT 
  clinic_id, 
  admin_email, 
  admin_password_hash IS NOT NULL as has_password
FROM clinic_settings
WHERE clinic_id = 'test';
```

### ステップ5: ログインを再試行

- メールアドレス: `info@dentee-tech.com`
- パスワード: `test1234`

---

## 追加のデバッグ情報

ログインAPIにデバッグログを追加する場合は、以下の情報を確認：

1. **リクエストボディ：** 送信されているメールアドレスとパスワード
2. **データベースクエリ結果：** 取得された`clinic_settings`の内容
3. **パスワード検証結果：** `verifyPassword`の戻り値

これらの情報は、VercelのRuntime Logsで確認できます。
