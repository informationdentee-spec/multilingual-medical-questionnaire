# セットアップ手順（ステップバイステップ）

## 📌 目標

以下のメールアドレスとパスワードでログインできるようにする：
- **メールアドレス**: `info@dentee-tech.com`
- **パスワード**: `test1234`

---

## ステップ1: パスワードハッシュを生成

### 1-1. コマンドを実行

プロジェクトのフォルダ（`Multilingual Medical Questionnaire`）で、以下のコマンドを実行：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test1234', 10).then(h => console.log(h));"
```

### 1-2. ハッシュをコピー

実行すると、以下のような長い文字列が表示されます：

```
$2b$10$RGNEGOcBEmtH4L70wC.Ku.XK1rvwnDLbSDf4v2pUe1RaI1Fb.udPO
```

**この文字列全体をコピーしてください。** これがパスワードハッシュです。

---

## ステップ2: SupabaseでSQLを実行

### 2-1. Supabase Dashboardにアクセス

1. ブラウザで https://app.supabase.com を開く
2. ログインする
3. プロジェクトを選択

### 2-2. SQL Editorを開く

1. 左メニューから「**SQL Editor**」をクリック
2. 「**New query**」ボタンをクリック（または既存のクエリをクリア）

### 2-3. まず、レコードが存在するか確認

以下のSQLで、`clinic_id = 'test'`のレコードが存在するか確認：

```sql
SELECT clinic_id FROM clinic_settings WHERE clinic_id = 'test';
```

**結果：**
- **レコードが表示される場合** → ステップ2-4に進む（UPDATE文を実行）
- **"No rows returned"と表示される場合** → ステップ2-3-Aを実行（INSERT文で新規作成）

### 2-3-A. レコードが存在しない場合（新規作成）

以下のSQLをコピー＆ペーストします。

**重要：** `'ここにハッシュを貼り付け'` の部分を、ステップ1でコピーしたハッシュに置き換えてください。

```sql
-- クリニック設定を新規作成（管理者情報も含む）
INSERT INTO clinic_settings (clinic_id, admin_email, admin_password_hash)
VALUES (
  'test',
  'info@dentee-tech.com',
  'ここにハッシュを貼り付け'
);
```

**例（実際のハッシュを使用）：**
```sql
INSERT INTO clinic_settings (clinic_id, admin_email, admin_password_hash)
VALUES (
  'test',
  'info@dentee-tech.com',
  '$2b$10$TPv5GuYaJ3EnB4NEuvxnLukQDWM38mJCR8cvdNsDKM2.i5jxm1SWa'
);
```

### 2-4. レコードが存在する場合（更新）

以下のSQLをコピー＆ペーストします。

**重要：** `'ここにハッシュを貼り付け'` の部分を、ステップ1でコピーしたハッシュに置き換えてください。

```sql
-- 管理者情報を更新
UPDATE clinic_settings
SET 
  admin_email = 'info@dentee-tech.com',
  admin_password_hash = 'ここにハッシュを貼り付け'
WHERE clinic_id = 'test';
```

**例（実際のハッシュを使用）：**
```sql
UPDATE clinic_settings
SET 
  admin_email = 'info@dentee-tech.com',
  admin_password_hash = '$2b$10$TPv5GuYaJ3EnB4NEuvxnLukQDWM38mJCR8cvdNsDKM2.i5jxm1SWa'
WHERE clinic_id = 'test';
```

### 2-5. 実行

1. 「**Run**」ボタン（または `Ctrl+Enter`）をクリック
2. 「Success」と表示されれば成功
   - INSERT文の場合：「Success. No rows returned」と表示される場合もありますが、正常です
   - UPDATE文の場合：「Success. No rows returned」と表示される場合は、レコードが存在しない可能性があります

---

## ステップ3: 設定を確認

### 3-1. 確認用SQLを実行

以下のSQLを実行して、設定が正しく保存されたか確認：

```sql
SELECT 
  clinic_id, 
  admin_email, 
  admin_password_hash IS NOT NULL as has_password
FROM clinic_settings
WHERE clinic_id = 'test';
```

### 3-2. 期待される結果

以下のように表示されれば成功：

| clinic_id | admin_email | has_password |
|-----------|-------------|--------------|
| test | info@dentee-tech.com | true |

---

## ステップ4: ログインを試す

### 4-1. ログインページにアクセス

ブラウザで以下のURLを開く：
- `https://multilingual-medical-questionnaire.vercel.app/admin/login`
- または、ローカル開発環境の場合は `http://localhost:3000/admin/login`

### 4-2. ログイン情報を入力

- **メールアドレス**: `info@dentee-tech.com`
- **パスワード**: `test1234`

### 4-3. ログインボタンをクリック

ログインが成功すると、管理ダッシュボードにリダイレクトされます。

---

## ⚠️ もしログインできない場合

### 確認事項1: テーブルが存在するか

以下のSQLで確認：

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'clinic_settings'
);
```

`false`が返る場合は、まずテーブルを作成する必要があります（`QUICK_SETUP.md`を参照）。

### 確認事項2: データが正しく設定されているか

```sql
SELECT 
  clinic_id, 
  admin_email, 
  LENGTH(admin_password_hash) as hash_length
FROM clinic_settings
WHERE clinic_id = 'test';
```

- `admin_email`が`info@dentee-tech.com`になっているか
- `hash_length`が`60`になっているか（bcryptハッシュは60文字）

### 確認事項3: パスワードハッシュを再生成

もし問題が続く場合は、ステップ1からやり直してください。

---

## 📝 まとめ

1. **パスワードハッシュを生成** → コマンドを実行してハッシュをコピー
2. **SQLを実行** → SupabaseでUPDATE文を実行
3. **確認** → SELECT文で設定を確認
4. **ログイン** → `info@dentee-tech.com` / `test1234` でログイン

---

## 🔑 ログイン情報（まとめ）

- **URL**: `https://multilingual-medical-questionnaire.vercel.app/admin/login`
- **メールアドレス**: `info@dentee-tech.com`
- **パスワード**: `test1234`
- **クリニックID**: `test`
