# Scratch Status Monitor - 新規設計プラン（oRPC版）

## プロジェクト概要

Scratchサービスの稼働状況を監視し、ユーザーに対してリアルタイムで状態を提供するステータスページシステム。

### 現在の課題

1. **UI/UXの複雑性**
   - JSXを使用した静的HTML生成による制限
   - インタラクティブな機能が限定的
   - デザインシステムの欠如
   - ステータス更新がリアルタイムでない

2. **開発効率の低さ**
   - 新機能追加時のボイラープレートが多い
   - テストが複雑で保守しづらい
   - UI の再利用性が低い
   - キャッシュロジックと表示ロジックの結合度が高い

3. **スケーラビリティの問題**
   - APIスキーマ定義の手動管理
   - フロントエンド型定義の自動生成ができていない
   - 複数モニター対応時の拡張が難しい

---

## 提案する新アーキテクチャ

### 全体構成

```
monorepo (pnpm workspaces)
├── apps/
│   ├── backend/        # API サーバー (Hono + oRPC)
│   ├── frontend/       # フロントエンド (TanStack Start)
│   └── dashboard/      # 管理ダッシュボード (TanStack Start)
├── packages/
│   ├── shared-api/     # oRPC API スキーマ定義
│   └── config/         # 共通設定
└── docs/               # ドキュメント
```

### 主要な改善点

#### 1. **フロントエンドフレームワーク：TanStack Start**

✅ **メリット：**
- フルスタック React フレームワーク（ファイルベースルーティング）
- サーバーコンポーネント対応で初期ロード高速化
- リアルタイム更新（Server-Sent Events対応）
- 型安全なAPI通信（oRPC との統合）
- SSR/SSG デフォルト対応

✅ **選定理由：**
- Vite ベースで開発速度が優秀
- 新しい設計でモダンな UI/UX を実現可能
- サーバーコンポーネント活用で キャッシング戦略が自然

#### 2. **バックエンドフレームワーク：HonoJS（継続）**

✅ **理由：**
- 既にプロジェクトに統合されている
- Cloudflare Workers への デプロイが最適化されている
- 軽量で高速

📦 **追加パッケージ：**
- **@orpc/server** - oRPC サーバー実装
- **@orpc/openapi** - OpenAPI 自動生成
- **Drizzle ORM** - データベース操作の型安全性
- **Zod** - ランタイムバリデーション

#### 3. **型安全性戦略：oRPC + Zod**

✅ **メリット：**
- バックエンド・フロントエンド間で型共有（自動型推論）
- ランタイムバリデーション
- OpenAPI 自動生成
- 極小バンドルサイズ（~8KB）
- フレームワーク非依存

📦 **パッケージ：**
```json
{
  "@orpc/server": "^1.x",
  "@orpc/client": "^1.x",
  "@orpc/openapi": "^1.x",
  "zod": "^3.x"
}
```

#### 4. **データベース&キャッシング戦略**

**階層化キャッシング：**
1. **レベル1：CDN キャッシュ** (Cloudflare)
   - ステータスデータ (5分単位)
   - 静的アセット (永続)

2. **レベル2：KV Store** (Cloudflare Workers KV)
   - 監視履歴データ
   - メタデータ・設定

3. **レベル3：メモリキャッシュ** (フロントエンド)
   - TanStack Query (React Query)
   - リアルタイム更新時の最適化

**リアルタイム更新：**
- Server-Sent Events (SSE) で状態変化を配信
- `useQueryClient()` + `setQueryData()` で UI 自動更新

#### 5. **UIコンポーネントライブラリ**

📦 **スタック：**
- **shadcn/ui** - ヘッドレスコンポーネントライブラリ
  - カスタマイズ性が高い
  - TypeScript対応
  - コピー&ペースト式でバンドルサイズ最小化

- **Tailwind CSS** - Utility-first CSS フレームワーク
  - ダークモード対応
  - レスポンシブデザイン容易

- **Framer Motion** - アニメーションライブラリ
  - ステータス遷移の視覚化に最適

#### 6. **状態管理**

📦 **アプローチ：**
- **Server State**: TanStack Query (サーバーデータ管理)
- **Client State**: Jotai または Zustand (UI状態管理)
  - Jotai推奨（原始的で合成性が高い）

---

## ディレクトリ構造

### バックエンド (`apps/backend`)

```
apps/backend/
├── src/
│   ├── index.ts                 # アプリケーションエントリ
│   ├── api.ts                   # oRPC API 定義
│   ├── procedures/
│   │   ├── monitors.ts          # モニター関連手続き
│   │   ├── status.ts            # ステータス情報手続き
│   │   ├── history.ts           # 履歴データ手続き
│   │   └── health.ts            # ヘルスチェック
│   ├── services/
│   │   ├── monitorService.ts    # モニター監視ロジック
│   │   ├── statusService.ts     # ステータス集計ロジック
│   │   └── cacheService.ts      # キャッシング戦略
│   ├── db/
│   │   ├── schema.ts            # Drizzle スキーマ定義
│   │   └── migrations/          # DB マイグレーション
│   └── utils/
│       ├── logger.ts
│       └── validators.ts        # Zod スキーマ
├── __tests__/
│   ├── unit/
│   └── integration/
└── wrangler.jsonc               # Cloudflare Workers 設定
```

### フロントエンド (`apps/frontend`)

```
apps/frontend/
├── src/
│   ├── routes/
│   │   ├── __root.tsx           # ルートレイアウト
│   │   ├── index.tsx            # ホームページ
│   │   ├── monitors/
│   │   │   └── $monitorId.tsx   # モニター詳細ページ
│   │   └── admin/
│   │       ├── index.tsx        # 管理ダッシュボード
│   │       └── settings.tsx     # 設定ページ
│   ├── components/
│   │   ├── ui/                  # shadcn/ui コンポーネント
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   └── features/
│   │       ├── StatusCard.tsx
│   │       ├── HistoryChart.tsx
│   │       └── IncidentTimeline.tsx
│   ├── hooks/
│   │   ├── useMonitors.ts       # oRPC クエリ hooks
│   │   ├── useStatus.ts
│   │   └── useSSE.ts            # Server-Sent Events
│   ├── lib/
│   │   ├── client.ts            # oRPC クライアント設定
│   │   ├── utils.ts             # ユーティリティ関数
│   │   └── stores.ts            # Jotai atom 定義
│   └── styles/
│       └── globals.css          # Tailwind 設定
├── tanstack.config.ts           # TanStack Start 設定
└── vite.config.ts
```

### 共有パッケージ (`packages/shared-api`)

```
packages/shared-api/
├── src/
│   ├── index.ts
│   ├── schemas/
│   │   ├── monitor.ts
│   │   ├── status.ts
│   │   ├── incident.ts
│   │   └── error.ts
│   └── procedures/               # oRPC 手続き定義
│       ├── monitors.ts
│       ├── status.ts
│       ├── history.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

---

## 実装進捗

| フェーズ | ステータス | 進捗 |
|---------|----------|------|
| Phase 1: 基盤整備 | ✅ 完了 | 100% |
| Phase 2: 基本UI実装 | ⏳ 進行中 | 0% |
| Phase 3: 管理機能 | ⬜ 未開始 | 0% |
| Phase 4: 高度な機能 | ⬜ 未開始 | 0% |

---

## 新機能一覧（段階的実装）

### Phase 1: 基盤整備 (週1-2) ✅ 完了

#### バックエンド実装
- [x] Hono フレームワーク導入
- [x] oRPC API スキーマ定義
- [x] ステータスチェックロジック実装
- [x] 履歴トラッキング機能
- [x] マルチレイヤーキャッシング
- [x] OpenAPI ドキュメント自動生成
- [x] Zod スキーマ検証
- [x] エラーハンドリング統一
- [x] Biome linter 導入

#### API エンドポイント実装
- [x] `GET /api/status` - ステータス取得
- [x] `POST /api/status/refresh` - 強制更新
- [x] `GET /api/history` - 全モニター履歴
- [x] `GET /api/history/:monitorId` - 特定モニター履歴
- [x] `GET /api/stats/:monitorId` - 統計情報

### Phase 2: 基本UI実装 (週3-4) ⏳ 進行中
- [ ] TanStack Start プロジェクト初期化
- [ ] oRPC クライアント統合
- [ ] shadcn/ui 導入
- [ ] ステータスページ再実装
- [ ] リアルタイム更新（SSE）
- [ ] 履歴グラフ（Recharts）
- [ ] ダークモード対応

### Phase 3: 管理機能 (週5-6) ⬜ 未開始
- [ ] 管理ダッシュボード実装
- [ ] モニター設定UI
- [ ] インシデント管理機能

### Phase 4: 高度な機能 (週7-8) ⬜ 未開始
- [ ] アラート機能（メール・webhook）
- [ ] API 制限機能
- [ ] 多言語対応の最適化
- [ ] 分析ダッシュボード

---

## 依存パッケージ一覧

### バックエンド

```json
{
  "dependencies": {
    "hono": "^4.x",
    "@orpc/server": "^1.x",
    "@orpc/openapi": "^1.x",
    "zod": "^3.x",
    "drizzle-orm": "^0.x"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "wrangler": "^3.x",
    "typescript": "^5.x"
  }
}
```

### フロントエンド

```json
{
  "dependencies": {
    "@tanstack/start": "^1.x",
    "@tanstack/react-router": "^1.x",
    "@tanstack/react-query": "^5.x",
    "@orpc/client": "^1.x",
    "react": "^19.x",
    "zod": "^3.x",
    "jotai": "^2.x",
    "tailwindcss": "^3.x",
    "shadcn-ui": "latest",
    "framer-motion": "^10.x",
    "recharts": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x"
  }
}
```

---

## 開発ワークフロー

### ローカル開発

```bash
# 依存関係インストール
pnpm install

# 全て起動
pnpm dev

# または個別起動
pnpm --filter backend dev
pnpm --filter frontend dev
```

### ビルド・デプロイ

```bash
# ビルド
pnpm build

# テスト
pnpm test

# Cloudflare Workers へデプロイ
pnpm --filter backend deploy
pnpm --filter frontend deploy
```

---

## マイグレーション戦略

### 段階的な移行手順

1. **新リポジトリブランチ作成**
   - `update/new-architecture` ブランチで作業

2. **バックエンド API のスキーマ化**
   - 既存 Hono ルートを oRPC 手続きに段階的に変更
   - OpenAPI 自動生成

3. **フロントエンド段階的置き換え**
   - ページ単位で TanStack Start に置き換え
   - 旧ページ（archive）との共存

4. **テスト・検証**
   - 全機能 E2E テスト
   - パフォーマンステスト

5. **本番反映**
   - canary デプロイメント
   - ロールバック手順の準備

---

## 期待される効果

### 開発効率の向上
- **ボイラープレート削減：30-40%**
- **新機能実装速度：2-3倍**
- **テスト作成時間：短縮可**

### UI/UX の向上
- リアルタイム更新による即応性
- インタラクティブなグラフ・アニメーション
- レスポンシブ設計の最初からの実装
- ダークモード標準対応

### 保守性の向上
- **型安全性：完全な型推論（oRPC）**
- **再利用性：コンポーネント化による共通化**
- **テスト性：層分離による単体テスト容易化**
- **API ドキュメント：自動生成（OpenAPI）**

### スケーラビリティ
- 複数モニター対応の容易化
- API 拡張が型安全に実施可能
- キャッシング戦略の柔軟な変更

---

## 総工期見積（1人開発想定）

| Phase | 期間 | 工数 |
|-------|------|------|
| 1: 基盤整備 | 1-2週 | 40h |
| 2: 基本UI | 2-3週 | 60h |
| 3: 管理機能 | 2週 | 40h |
| 4: 高度機能 | 2週 | 40h |
| テスト・最適化 | 1週 | 20h |
| **合計** | **8-10週** | **200h** |

---

## oRPC 選定の理由

### 主な利点

1. **極小バンドルサイズ（~8KB）**
   - Cloudflare Workers の制約に最適
   - tRPC（~30KB）の約3分の1

2. **OpenAPI 自動生成**
   - API ドキュメント自動生成
   - 外部 API クライアント生成可能

3. **セットアップが簡潔**
   - ボイラープレート最小限
   - 学習コスト低い

4. **フレームワーク非依存**
   - Hono、Express など複数フレームワーク対応
   - 既存 Hono バックエンドとの統合が自然

5. **型推論が強力**
   - フロントエンドで自動的に型が推論される
   - IDE サポートが優秀

### 開発効率の向上

- API スキーマ定義とフロントエンド実装が同期
- 手動での型定義が不要
- OpenAPI ドキュメント自動生成で外部連携も簡単
- tRPC より学習曲線が緩い

---

## 参考資料

- [TanStack Start 公式](https://tanstack.com/start)
- [oRPC 公式](https://orpc.run)
- [Zod 公式](https://zod.dev)
- [shadcn/ui 公式](https://ui.shadcn.com)
- [Hono 公式](https://hono.dev)

