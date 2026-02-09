# データ管理方法

Scratch Status Monitor のバックエンドにおけるデータの管理方法を整理したドキュメントです。

## 目次

1. [概要](#概要)
2. [ストレージレイヤー](#ストレージレイヤー)
3. [データフロー](#データフロー)
4. [二層キャッシュ戦略](#二層キャッシュ戦略)
5. [トリガーと実行フロー](#トリガーと実行フロー)
6. [保存処理の詳細](#保存処理の詳細)
7. [初期化シーケンス](#初期化シーケンス)
8. [エラーハンドリング](#エラーハンドリング)

---

## 概要

バックエンドは **2つのストレージレイヤー** を使い分けてデータを管理します：

| ストレージ | 用途 | 特性 |
|----------|------|------|
| **プロセスストレージ** | 高速キャッシュ | メモリ上、揮発性、サーバー再起動で消失 |
| **KV ストレージ** | 永続化 | Cloudflare KV、永続化、API コスト |

---

## ストレージレイヤー

### 1. プロセスストレージ（メモリキャッシュ）

**実装**: `memoryCache: Map<string, Data>`

```typescript
// CacheService
private memoryCache: Map<string, { data: StatusResponseType; expiresAt: number }> = new Map();

// HistoryService
private memoryCache: Map<string, StoredHistoryData> = new Map();
```

**特性**：
- ✅ 高速（メモリアクセス）
- ✅ レイテンシーが低い
- ❌ サーバー再起動で消失
- ❌ 複数プロセス間で共有不可

**役割**：
- HTTP リクエスト中の一時的なキャッシュ
- 次の KV 書き込みまでのバッファ
- TTL で自動的に有効期限を管理

### 2. KV ストレージ（Cloudflare KV）

**実装**: Cloudflare Workers binding `SCRAC_SSM_KV`

**特性**：
- ✅ 永続化（サーバー再起動後も存在）
- ✅ グローバルアクセス
- ❌ API コスト（読み取り・書き込み）
- ❌ レイテンシーが高い（数十〜数百 ms）

**役割**：
- 長期データ保存
- 複数ワーカー間でのデータ共有
- バックアップ

---

## データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP リクエスト                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              1. キャッシュから取得を試みる                    │
│                 getStatus() → cacheService.get()             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                  ┌────────────────┐
                  │ キャッシュ有効？  │
                  └────────────────┘
                    ↙             ↖
                   YES             NO
                    ↓               ↓
           ┌────────────────┐  ┌──────────────────────┐
           │ 即座に返す      │  │ 2. 新規チェック実行  │
           └────────────────┘  │ checkAllMonitors()   │
                              └──────────────────────┘
                                    ↓
                        ┌──────────────────────┐
                        │ 3. 全モニターをチェック │
                        │ checkMultipleMonitors()│
                        └──────────────────────┘
                                    ↓
                        ┌──────────────────────┐
                        │ 4. ステータスを構築   │
                        │ buildStatusResponse()  │
                        └──────────────────────┘
                                    ↓
                        ┌──────────────────────┐
                        │ 5. 保存処理           │
                        │ キャッシュサービス    │
                        │ 履歴サービス          │
                        └──────────────────────┘
```

---

## 二層キャッシュ戦略

### キャッシュサービス (`KVCacheService`)

```
get() メソッド
├─ Step 1: メモリキャッシュから取得
│          ├─ 存在 → 即座に返す ✅
│          └─ 存在しない → 次へ
│
└─ Step 2: KV から取得
           ├─ 取得成功 → メモリキャッシュに格納して返す
           └─ 取得失敗 → null
```

```
set() メソッド
├─ Step 1: メモリキャッシュに即座に保存
│          └─ TTL 付きで登録
│
└─ Step 2: KV 書き込み判定
           ├─ 最後の書き込みから一定時間経過？
           │  └─ YES → KV に書き込み（非同期、await しない）
           └─ NO → スキップ
```

**タイムライン例**（設定値：statusTtlMs=5分、kvWriteIntervalMs=1分）：

```
時刻   checkAllMonitors()     メモリキャッシュ        KV ストレージ
────────────────────────────────────────────────────────────
00:00  実行 → set()           ✓ 保存（5分有効）       ✓ 保存
                              ───────────────────
00:01  GET リクエスト         ✓ 返す
                              
00:02  実行 → set()           ✓ 保存（5分有効）       ✗ スキップ
                                                     （1分未経過）

00:03  実行 → set()           ✓ 保存（5分有効）       ✗ スキップ

00:04  実行 → set()           ✓ 保存（5分有効）       ✓ 保存
                                                     （3分経過）
00:05  GET リクエスト         ✗ 有効期限切れ         ✓ KVから取得
                              → KV から取得
```

### 履歴サービス (`KVHistoryService`)

同じ二層キャッシュ戦略を採用：

- **メモリキャッシュ**: `Map<string, StoredHistoryData>` per monitor
- **KV 書き込み判定**: `lastKVWriteTime: Map<string, number>`（モニターごと）
- **TTL**: 30 日（Cloudflare の自動削除）

---

## トリガーと実行フロー

### トリガー源

| トリガー | 実行間隔 | 実装箇所 |
|---------|--------|--------|
| **Cron** | 設定値（デフォルト5分） | `wrangler.jsonc` |
| **HTTP API** | 手動実行 | `/api/v1/health` など |
| **テストエンドポイント** | 開発時のみ | `/test/trigger-monitor-check` |

### Cron トリガーフロー

```typescript
// wrangler.jsonc
triggers:
  crons: ["*/5 * * * *"]  // 5分ごと
```

```typescript
// index.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    await handleCron(event, env);
  }
}

async function handleCron(event: ScheduledEvent, env: Env): Promise<void> {
  // Step 1: サービス初期化
  initializeCacheService(env.SCRAC_SSM_KV);
  initializeHistoryService(env.SCRAC_SSM_KV);
  
  // Step 2: チェック実行
  const result = await checkAllMonitors();
  
  // Step 3: ログ出力
  console.log(JSON.stringify(result));
}
```

---

## 保存処理の詳細

### cacheService.set() の実行フロー

```typescript
async set(data: StatusResponseType): Promise<void> {
  // Step 1: メモリキャッシュに即座に保存
  const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
  this.memoryCache.set(CACHE_KEY, { data, expiresAt });

  // Step 2: KV 書き込み判定
  const now = Date.now();
  if (now - this.lastKVWriteTime > ssmrc.cache.kvWriteIntervalMs) {
    // Step 3: 書き込みタイムスタンプ更新
    this.lastKVWriteTime = now;
    
    // Step 4: KV に書き込み（非同期、await しない）
    this.kv
      .put(CACHE_KEY, JSON.stringify(data), {
        expirationTtl: Math.ceil(ssmrc.cache.statusTtlMs / 1000),
      })
      .catch((err: Error) => {
        console.error("Failed to write cache to KV:", err);
      });
  }
}
```

**重要な特性**：

- ✅ メモリ書き込みは **同期的かつ即座**
- ⏳ KV 書き込みは **非同期かつ条件付き**
- 🔄 `await` しない → リクエストレスポンスをブロックしない
- 🛡️ `.catch()` で KV 書き込み失敗を処理

### historyService.saveRecord() の実行フロー

```typescript
async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
  // Step 1: メモリキャッシュから既存データを取得
  let existing = this.memoryCache.get(monitorId);
  if (!existing) {
    existing = { records: [], lastUpdated: new Date().toISOString() };
    this.memoryCache.set(monitorId, existing);
  }

  // Step 2: 新規レコードを追加
  existing.records.push({
    id: uuidv4(),
    monitorId,
    status: result.status,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    errorMessage: result.errorMessage,
    recordedAt: result.checkedAt.toISOString(),
  });
  existing.lastUpdated = new Date().toISOString();

  // Step 3: KV 書き込み判定（モニターごと）
  const now = Date.now();
  const lastWriteTime = this.lastKVWriteTime.get(monitorId) || 0;
  if (now - lastWriteTime > ssmrc.cache.kvWriteIntervalMs) {
    // Step 4: 書き込みタイムスタンプ更新
    this.lastKVWriteTime.set(monitorId, now);
    
    // Step 5: KV に書き込み（非同期）
    this.kv
      .put(this.getKey(monitorId), JSON.stringify(existing), {
        expirationTtl: 30 * 24 * 60 * 60, // 30日
      })
      .catch((err: Error) => {
        console.error(`Failed to write history for ${monitorId}:`, err);
      });
  }
}
```

---

## 初期化シーケンス

### アプリケーション起動時

```
アプリケーション起動
        ↓
ミドルウェア実行（毎リクエスト）
├─ initializeCacheService(c.env.SCRAC_SSM_KV)
│  └─ グローバル変数 `cacheServiceInstance` を設定
│
└─ initializeHistoryService(c.env.SCRAC_SSM_KV)
   └─ グローバル変数 `historyServiceInstance` を設定
```

**注意点**：
- ✅ 毎リクエストで初期化していても、既に存在すればスキップ
- ❌ 複数回の初期化は避けるべき
- 🔑 `c.env.SCRAC_SSM_KV` が null の場合は InMemory 版を使用

### Cron トリガー実行時

```
Cron トリガー発火（5分ごと）
        ↓
handleCron() 実行
├─ initializeCacheService(env.SCRAC_SSM_KV)
├─ initializeHistoryService(env.SCRAC_SSM_KV)
└─ checkAllMonitors()
```

---

## エラーハンドリング

### KV 書き込み失敗

```typescript
// cacheService.ts
this.kv.put(...).catch((err: Error) => {
  console.error("Failed to write cache to KV:", err);
  // エラーを記録するが、リクエストは続行
  // メモリキャッシュには正常に保存されている
});
```

**戦略**：
- ✅ KV 書き込み失敗は **非致命的**
- ✅ メモリキャッシュには保存されている
- ⚠️ エラーはログ出力のみ
- 🔄 次の書き込み時に再試行（5分間隔）

### メモリキャッシュ有効期限切れ

```typescript
async get(): Promise<StatusResponseType | null> {
  const entry = this.memoryCache.get(CACHE_KEY);
  
  if (!entry) {
    return null;  // キャッシュなし → KV から取得
  }

  if (Date.now() > entry.expiresAt) {
    this.memoryCache.delete(CACHE_KEY);  // 削除
    return null;  // KV から取得
  }

  return entry.data;  // 有効 → 返す
}
```

### モニターチェック失敗

```typescript
const checkResults = await checkMultipleMonitors(monitorsToCheck, {
  timeout: 10000,  // 10秒でタイムアウト
});

// タイムアウト or エラーの場合も結果として返す
// status: "error" で保存される
```

---

## 設定値一覧

`ssm-configs` で管理：

```typescript
// packages/configs/src/cache.ts
export const cache = {
  statusTtlMs: 5 * 60 * 1000,        // キャッシュ有効期限: 5分
  kvWriteIntervalMs: 1 * 60 * 1000,  // KV書き込み間隔: 1分
};
```

`wrangler.jsonc` で管理：

```jsonc
{
  "env": {
    "production": {
      "triggers": {
        "crons": ["*/5 * * * *"]  // Cron実行間隔: 5分
      }
    }
  }
}
```

---

## トラブルシューティング

### Q: メモリ使用量が増え続けている

**原因候補**：
- メモリキャッシュが有効期限切れのエントリを保持
- 履歴レコードが蓄積

**対策**：
```typescript
// 有効期限切れのクリーンアップ（未実装時）
for (const [key, entry] of this.memoryCache.entries()) {
  if (Date.now() > entry.expiresAt) {
    this.memoryCache.delete(key);
  }
}
```

### Q: KV への保存に失敗している

**確認項目**：
1. `SCRAC_SSM_KV` binding が `wrangler.jsonc` で正しく設定されているか
2. KV ストレージの API レート制限に達していないか
3. エラーログを確認（`Failed to write cache to KV`）

### Q: Cron トリガーが実行されない

**確認項目**：
1. `wrangler.jsonc` の `triggers.crons` が設定されているか
2. ワーカーがデプロイされているか
3. Cloudflare ダッシュボードのトリガー設定を確認

---

## 今後の改善案

- [ ] メモリキャッシュの定期クリーンアップ機構
- [ ] KV 書き込み失敗時のリトライロジック
- [ ] キャッシュヒット率のメトリクス収集
- [ ] メモリ使用量の監視と上限設定
- [ ] 複数モニター間での効率的な一括保存
