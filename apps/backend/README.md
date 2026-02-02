# Scratch Status Monitor - Backend

Cloudflare Workers + Hono によるステータス監視 API

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.dev.vars.example` を `.dev.vars` にコピーして、環境変数を設定してください：

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` の設定例：

```bash
# API Bearer 認証トークン（任意）
API_TOKEN=your-secret-token-here

# 環境モード
ENVIRONMENT=development
```

## 開発

### ローカル開発サーバーの起動

```bash
npm run dev
```

### 型定義の生成

[Worker 設定に基づいて型を生成/同期](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
npm run cf-typegen
```

## 認証

Bearer 認証で保護されています。環境に応じて適用範囲が変わります。

### 本番環境 (ENVIRONMENT=production)

- **全てのルート**に認証が必要

```bash
curl -H "Authorization: Bearer your-secret-token-here" \
  https://api.ssm.scratchcore.org/api/status
```

### 開発環境 (ENVIRONMENT=development)

以下のルートは認証**不要**:
- `/` - ルートエンドポイント
- `/test/*` - テストエンドポイント
- `/docs` - API ドキュメント (Scalar UI)
- `/openapi.json` - OpenAPI 仕様

上記以外のルートは認証が必要:

```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:8787/status
```

### 認証の無効化

開発環境で全ての認証を無効にする場合は、`.dev.vars` から `API_TOKEN` を削除してください。

## テストエンドポイント

開発環境 (`ENVIRONMENT=development`) のみ、以下のテストエンドポイントが有効です（認証不要）：

- `POST /test/trigger-monitor-check` - 手動でモニターチェックをトリガー

本番環境では 404 を返します。

## デプロイ

```bash
npm run deploy
```

デプロイ時には Cloudflare Dashboard で以下の環境変数を設定してください：

- `API_TOKEN` - API 認証トークン（必須）
- `ENVIRONMENT` - `production` に設定

## API ドキュメント

- OpenAPI 仕様: `/openapi.json`
- Scalar UI: `/docs`

