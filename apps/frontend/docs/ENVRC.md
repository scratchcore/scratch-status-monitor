# envrc.ts による環境変数管理

`envrc.ts` を使用すると、型安全で保守性の高い環境変数管理が可能になります。

## 基本的な使い方

### 1. envrc.ts で環境変数を定義

```typescript
import { defineConfig } from "./plugins/envrc/schema";

const envrc = defineConfig({
  env: {
    VITE_BACKEND_URL: {
      required: true,
      description: "バックエンドAPIのベースURL",
    },
    VITE_API_TIMEOUT: {
      required: false,
      description: "APIタイムアウト時間（ミリ秒）",
      default: "5000",
      validate: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
      },
    },
    NODE_ENV: {
      required: false,
      description: "Node環境（development, production, test）",
      default: "development",
    },
  },
});

export default envrc;
```

### 2. 環境変数を使用

```typescript
import { getEnv, getServerEnv, getClientEnv } from "@/plugins/envrc";

// サーバー側
const env = getServerEnv({ throwOnError: true });
console.log(env.VITE_BACKEND_URL);

// クライアント側
const clientEnv = getClientEnv({ throwOnError: true });
console.log(clientEnv.VITE_BACKEND_URL);
```

## EnvVarConfig のプロパティ

### required (boolean)
- `true`: 必須の環境変数。設定されていない場合はエラー
- `false`: オプションの環境変数

### description (string)
- 環境変数の説明
- ドキュメント生成時に使用されます

### default (string, optional)
- デフォルト値
- `required: false` の場合のみ有効

```typescript
VITE_API_TIMEOUT: {
  required: false,
  description: "APIタイムアウト時間",
  default: "5000",
}
```

### validate (function, optional)
- カスタムバリデーション関数
- `true` を返すと成功、`false` または エラーメッセージを返すと失敗

```typescript
VITE_PORT: {
  required: false,
  description: "ポート番号",
  validate: (value) => {
    const port = Number(value);
    if (isNaN(port)) return "Port must be a number";
    if (port < 1 || port > 65535) return "Port must be between 1 and 65535";
    return true;
  },
}
```

## ユーティリティ関数

### generateEnvDocs()

環境変数のドキュメントを自動生成:

```typescript
import envrc from "./envrc";
import { generateEnvDocs } from "@/plugins/envrc/schema";

const docs = generateEnvDocs(envrc);
console.log(docs);
```

出力例:
```markdown
# Environment Variables

## VITE_BACKEND_URL
**Required**

バックエンドAPIのベースURL

## VITE_API_TIMEOUT
*Optional* (default: 5000)

APIタイムアウト時間（ミリ秒）
```

### getRequiredEnvKeys()

必須環境変数のリストを取得:

```typescript
import envrc from "./envrc";
import { getRequiredEnvKeys } from "@/plugins/envrc/schema";

const required = getRequiredEnvKeys(envrc);
console.log(required); // ["VITE_BACKEND_URL"]
```

## 自動的な型推論

`envrc.ts` の定義から、TypeScript の型が自動的に生成されます:

```typescript
// envrc.ts
const envrc = defineConfig({
  env: {
    VITE_BACKEND_URL: { required: true, description: "..." },
    VITE_TIMEOUT: { required: false, description: "...", default: "5000" },
  },
});

// 生成される型 (InferEnvType により自動推論):
type Env = {
  VITE_BACKEND_URL: string;        // required: true
  VITE_TIMEOUT: string | undefined; // required: false
};
```

## クライアント/サーバー環境変数の分離

- **VITE_** プレフィックス: クライアント側でも使用可能
- プレフィックスなし: サーバー側のみ

```typescript
const envrc = defineConfig({
  env: {
    VITE_PUBLIC_API: {  // ← クライアント・サーバー両方で利用可能
      required: true,
      description: "公開API",
    },
    DATABASE_URL: {     // ← サーバー側のみ
      required: true,
      description: "データベース接続URL",
    },
  },
});
```

## 起動時チェック

環境変数は Vite の起動時に自動的にチェックされます:

```typescript
// vite.config.ts
import { envCheckPlugin } from "./src/plugins/envrc/vite-plugin";

export default defineConfig({
  plugins: [
    envCheckPlugin(), // ← 起動時に環境変数をチェック
    // ... other plugins
  ],
});
```

必須の環境変数が設定されていない場合、サーバーは起動に失敗します。

## ベストプラクティス

### 1. 明確な命名規則

```typescript
// ✅ Good
VITE_BACKEND_URL
VITE_API_TIMEOUT
DATABASE_CONNECTION_STRING

// ❌ Bad  
URL
TIMEOUT
DB
```

### 2. 適切な説明を追加

```typescript
// ✅ Good
description: "バックエンドAPIのベースURL（例: https://api.example.com）"

// ❌ Bad
description: "URL"
```

### 3. バリデーションを活用

```typescript
VITE_RETRY_COUNT: {
  required: false,
  description: "リトライ回数",
  default: "3",
  validate: (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  },
}
```

### 4. デフォルト値の設定

```typescript
// ✅ Good - 開発に適したデフォルト値
VITE_LOG_LEVEL: {
  required: false,
  description: "ログレベル",
  default: "debug", // 開発時は詳細ログ
}
```

## トラブルシューティング

### Q: 環境変数が読み込まれない

A: `.env` ファイルが正しい場所にあるか確認してください:
```
apps/frontend/.env
```

### Q: クライアント側で環境変数が undefined

A: `VITE_` プレフィックスがついているか確認してください。

### Q: バリデーションエラーが出る

A: `validate` 関数を確認し、正しい形式で値を設定してください。

```bash
# .env
VITE_PORT=abc  # ❌ 数値でない
VITE_PORT=3000 # ✅ OK
```
