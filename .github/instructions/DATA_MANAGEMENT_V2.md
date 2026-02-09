# データ管理方法 v2.0: プロセスストレージ主・KV従戦略

## 概要

KV ストレージの API リミット問題を解決するため、**プロセスストレージを主体**とし、**KV をバックアップ**として使用する新しいアプローチです。

### 従来の問題点

| 問題 | 詳細 |
|------|------|
| **KV 読み取り頻度が高い** | HTTP リクエストごとにキャッシュ確認で KV 読み取り |
| **KV 書き込み頻度が高い** | 5分間隔での書き込みでも半日以内にリミット到達 |
| **API コスト** | Cloudflare KV の無料枠を超過 |
| **レイテンシー** | KV アクセスによる遅延（数十〜数百 ms） |

### 新アプローチの特徴

| 特徴 | 詳細 |
|------|------|
| ✅ **プロセスストレージ主体** | 全データをメモリで管理、高速アクセス |
| ✅ **KV は定期バックアップのみ** | 30~分間隔での書き込み |
| ✅ **起動時のみ KV 読み取り** | サーバー再起動時の復元のみ |
| ✅ **API コスト削減** | 読み取り: 99%削減、書き込み: 80〜90%削減 |

---

## データ容量試算

### 前提条件

- **保存期間**: 7日間
- **チェック間隔**: 5分（1日 288回）
- **レコードサイズ**: 約 180 bytes/レコード

### 計算式

```
1モニター × 7日間 = 7日 × 288回/日 × 180 bytes = 約 0.36 MB
10モニター × 7日間 = 10 × 0.36 MB = 約 3.6 MB
```

### 容量評価

| 監視対象数 | 7日間のデータ量 | Cloudflare Workers メモリ上限との比較 |
|-----------|---------------|----------------------------------|
| 1モニター | 0.36 MB | 0.36% (上限 128 MB) |
| 10モニター | 3.6 MB | 2.8% (上限 128 MB) |
| 50モニター | 18 MB | 14% (上限 128 MB) |
| 100モニター | 36 MB | 28% (上限 128 MB) |

**結論**: 10〜50モニター程度であれば、プロセスストレージのみで十分に管理可能

---

## 新アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                   プロセスストレージ                      │
│                     （メモリ）                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  全ての履歴データを保持                          │   │
│  │  - 7日分の履歴レコード                           │   │
│  │  - 最新のステータス情報                          │   │
│  │  - TTL 管理（古いデータは自動削除）              │   │
│  └─────────────────────────────────────────────────┘   │
│                     ↑                  ↓                │
│                起動時読み込み      定期バックアップ       │
└─────────────────────────────────────────────────────────┘
                     ↑                  ↓
┌─────────────────────────────────────────────────────────┐
│                   KV ストレージ                          │
│              （Cloudflare KV）                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  バックアップデータのみ保持                      │   │
│  │  - 定期的なスナップショット（5〜15分間隔）       │   │
│  │  - サーバー再起動時の復元用                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## データフロー詳細

### 1. 起動時フロー（コールドスタート）

```
サーバー起動
    ↓
プロセスストレージは空
    ↓
KV ストレージから全データを読み込み
    ↓
プロセスストレージに展開
    ↓
サービス開始
```

**実装イメージ**:

```typescript
// サービス初期化時
async function initializeService(kv: KVNamespace) {
  // メモリキャッシュが空の場合のみ KV から読み込み
  if (memoryCache.size === 0) {
    console.log("Loading data from KV...");
    const kvData = await kv.get("backup:all-data", "json");
    if (kvData) {
      // KV データをメモリに展開
      restoreFromBackup(kvData);
      console.log("Data restored from KV");
    }
  }
}
```

### 2. 通常運用フロー

```
HTTP リクエスト
    ↓
プロセスストレージから即座に取得
    ↓
レスポンス返却（高速）
```

**KV アクセスなし** → レイテンシー改善

### 3. データ更新フロー（Cron トリガー）

```
Cron トリガー（5分間隔）
    ↓
モニターチェック実行
    ↓
プロセスストレージに保存（即座）
    ↓
一定時間経過判定
    ↓
YES → KV にバックアップ（非同期）
NO  → スキップ
```

**実装イメージ**:

```typescript
async saveData(data: HistoryData) {
  // Step 1: プロセスストレージに即座に保存
  memoryCache.set(key, data);

  // Step 2: KV バックアップ判定（例：15分ごと）
  const now = Date.now();
  if (now - lastBackupTime > 15 * 60 * 1000) {
    lastBackupTime = now;
    
    // Step 3: 非同期でバックアップ（await しない）
    kv.put("backup:all-data", JSON.stringify(getAllData()), {
      expirationTtl: 7 * 24 * 60 * 60, // 7日
    }).catch(err => console.error("Backup failed:", err));
  }
}
```

### 4. データクリーンアップフロー

```
定期実行（1時間ごと）
    ↓
7日以前のレコードを削除
    ↓
メモリ使用量を最適化
```

**実装イメージ**:

```typescript
function cleanupOldRecords() {
  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7日前
  
  for (const [monitorId, records] of memoryCache.entries()) {
    // 7日以前のレコードを削除
    const validRecords = records.filter(
      r => new Date(r.recordedAt).getTime() > cutoffTime
    );
    
    if (validRecords.length === 0) {
      memoryCache.delete(monitorId);
    } else {
      memoryCache.set(monitorId, validRecords);
    }
  }
}
```

---

## KV アクセス頻度の比較

### 従来アプローチ（v1.0）

| 操作 | 頻度 | 1日あたり | 1週間あたり |
|------|------|-----------|------------|
| **読み取り** | HTTP リクエストごと | 1,000〜10,000回 | 7,000〜70,000回 |
| **書き込み（キャッシュ）** | 1分間隔 | 1,440回 | 10,080回 |
| **書き込み（履歴）** | 5分間隔 × 10モニター | 2,880回 | 20,160回 |
| **合計** | - | **5,320〜14,320回/日** | **37,240〜100,240回/週** |

### 新アプローチ（v2.0）

| 操作 | 頻度 | 1日あたり | 1週間あたり |
|------|------|-----------|------------|
| **読み取り** | 起動時のみ | 0〜5回 | 0〜35回 |
| **書き込み（バックアップ）** | 15分間隔 | 96回 | 672回 |
| **合計** | - | **96〜101回/日** | **672〜707回/週** |

### 削減率

- **読み取り**: **99.5%削減** （10,000 → 5回/日）
- **書き込み**: **97.8%削減** （4,320 → 96回/日）
- **全体**: **98.2%削減** （14,320 → 101回/日）

---

## 設定値の変更

### 現行設定（v1.0）

```typescript
// packages/configs/src/cache.ts
export const cache = {
  statusTtlMs: 5 * 60 * 1000,        // 5分
  kvWriteIntervalMs: 1 * 60 * 1000,  // 1分
};
```

### 新設定（v2.0）

```typescript
// packages/configs/src/cache.ts
export const cache = {
  statusTtlMs: 5 * 60 * 1000,          // 5分（変更なし）
  kvBackupIntervalMs: 15 * 60 * 1000,  // 15分（KVバックアップ間隔）
  dataRetentionDays: 7,                // 7日間保持
  cleanupIntervalMs: 60 * 60 * 1000,   // 1時間ごとにクリーンアップ
};
```

---

## 実装の変更点

### 1. CacheService の変更

**従来（v1.0）**:
```typescript
async get() {
  // メモリ → KV の順で確認
  const memEntry = this.memoryCache.get(key);
  if (memEntry) return memEntry;
  
  const kvEntry = await this.kv.get(key);  // ← KV 読み取り
  return kvEntry;
}

async set(data) {
  this.memoryCache.set(key, data);
  
  if (intervalPassed) {
    await this.kv.put(key, data);  // ← 頻繁な KV 書き込み
  }
}
```

**新方式（v2.0）**:
```typescript
async get() {
  // メモリのみから取得（KV アクセスなし）
  return this.memoryCache.get(key) || null;
}

async set(data) {
  this.memoryCache.set(key, data);
  
  // バックアップ判定（15分間隔）
  if (shouldBackup()) {
    this.backupToKV();  // 非同期バックアップ
  }
}

private async backupToKV() {
  // 全データを一括でバックアップ
  const allData = this.getAllData();
  this.kv.put("backup:snapshot", JSON.stringify(allData))
    .catch(err => console.error("Backup failed:", err));
}
```

### 2. HistoryService の変更

**従来（v1.0）**:
```typescript
async getRecords(monitorId: string) {
  // メモリ確認
  let records = this.memoryCache.get(monitorId);
  if (!records) {
    // KV から読み込み ← 頻繁なアクセス
    records = await this.kv.get(`history:${monitorId}`);
    this.memoryCache.set(monitorId, records);
  }
  return records;
}
```

**新方式（v2.0）**:
```typescript
async getRecords(monitorId: string) {
  // メモリのみから取得
  return this.memoryCache.get(monitorId) || [];
}

// 起動時のみ実行
async restoreFromBackup() {
  const backup = await this.kv.get("backup:all-histories", "json");
  if (backup) {
    for (const [monitorId, records] of Object.entries(backup)) {
      this.memoryCache.set(monitorId, records);
    }
  }
}
```

### 3. 初期化処理の追加

```typescript
// index.ts
app.use("*", async (c, next) => {
  if (c.env.SCRAC_SSM_KV) {
    // 初回のみバックアップから復元
    await restoreFromKVIfNeeded(c.env.SCRAC_SSM_KV);
  }
  await next();
});

async function restoreFromKVIfNeeded(kv: KVNamespace) {
  if (!isDataLoaded) {
    console.log("Restoring from KV backup...");
    await cacheService.restoreFromBackup();
    await historyService.restoreFromBackup();
    isDataLoaded = true;
    console.log("Data restored successfully");
  }
}
```

---

## メリット・デメリット

### メリット

| メリット | 詳細 |
|---------|------|
| ✅ **KV API コスト削減** | 98%以上の削減 |
| ✅ **レスポンス速度向上** | メモリアクセスのみ（< 1ms） |
| ✅ **リミット回避** | 無料枠で十分に運用可能 |
| ✅ **シンプルな設計** | KV は完全にバックアップ用途のみ |
| ✅ **スケーラビリティ** | 100モニターまで対応可能 |

### デメリット

| デメリット | 詳細 | 対策 |
|-----------|------|------|
| ⚠️ **再起動時のデータロス** | 最大15分のデータ損失の可能性 | バックアップ間隔を短縮（5分） |
| ⚠️ **メモリ使用量増加** | 全データをメモリ保持 | クリーンアップで7日以前を削除 |
| ⚠️ **複数ワーカー間の同期** | プロセスごとに独立したデータ | 単一ワーカー運用を推奨 |
| ⚠️ **起動時間増加** | KV からの復元に数秒 | 起動頻度が低いため影響小 |

---

## 運用上の考慮事項

### 1. データ損失リスク

**リスク**: サーバークラッシュ時、最後のバックアップ以降のデータが失われる

**対策**:
- バックアップ間隔を短縮（15分 → 5分）
- 重要なイベント（エラー発生など）で即座にバックアップ
- Cloudflare Workers は高可用性のため、クラッシュ頻度は低い

### 2. メモリ管理

**監視項目**:
- メモリ使用量のトレンド
- クリーンアップの実行頻度
- 古いデータの削除状況

**実装例**:
```typescript
// メモリ使用量監視
function logMemoryUsage() {
  const usage = {
    cacheSize: memoryCache.size,
    historyRecords: getTotalRecordCount(),
    estimatedMB: estimateMemoryUsage(),
  };
  console.log("Memory usage:", usage);
}
```

### 3. バックアップの整合性

**確認項目**:
- バックアップ成功率
- 復元時のデータ整合性
- バックアップデータのサイズ

**実装例**:
```typescript
async function backupWithVerification() {
  const data = getAllData();
  const checksum = calculateChecksum(data);
  
  await kv.put("backup:snapshot", JSON.stringify(data));
  await kv.put("backup:checksum", checksum);
  
  console.log("Backup completed:", { 
    size: JSON.stringify(data).length,
    checksum 
  });
}
```

---

## 移行計画

### Phase 1: 準備（1週間）

- [x] 新アーキテクチャのコード実装
- [x] メモリ使用量監視の実装
- [x] バックアップ・復元機能のテスト
- [x] クリーンアップ機構の実装

### Phase 2: テスト環境での検証（1週間）

- [ ] 開発環境で動作確認
- [ ] メモリ使用量の測定
- [ ] バックアップ間隔の最適化
- [ ] 負荷テスト

### Phase 3: 本番移行（段階的）

- [ ] 本番環境にデプロイ
- [ ] KV アクセス頻度の監視
- [ ] メモリ使用量の監視
- [ ] 1週間の安定稼働確認

### Phase 4: 最適化

- [ ] バックアップ間隔の調整
- [ ] クリーンアップ頻度の調整
- [ ] パフォーマンスチューニング

---

## トラブルシューティング

### Q: サーバー再起動後、データが復元されない

**確認項目**:
1. KV に `backup:snapshot` キーが存在するか
2. `restoreFromBackup()` が正しく実行されているか
3. エラーログを確認

**対策**:
```typescript
async restoreFromBackup() {
  try {
    const backup = await this.kv.get("backup:snapshot", "json");
    if (!backup) {
      console.warn("No backup found in KV");
      return;
    }
    // 復元処理
    console.log("Restored from backup:", Object.keys(backup).length);
  } catch (err) {
    console.error("Restore failed:", err);
  }
}
```

### Q: メモリ使用量が想定より多い

**確認項目**:
1. クリーンアップが正しく実行されているか
2. 7日以前のデータが削除されているか
3. メモリリークがないか

**診断コマンド**:
```typescript
// デバッグ用エンドポイント
app.get("/debug/memory", (c) => {
  return c.json({
    cacheSize: memoryCache.size,
    totalRecords: getTotalRecordCount(),
    oldestRecord: getOldestRecordDate(),
    newestRecord: getNewestRecordDate(),
  });
});
```

### Q: バックアップ頻度を動的に変更したい

**実装例**:
```typescript
// 設定で管理
const backupInterval = ssmrc.cache.kvBackupIntervalMs;

// エラー発生時は即座にバックアップ
if (hasError) {
  await forceBackup();
}
```

---

## まとめ

### 主要な変更点

| 項目 | v1.0（従来） | v2.0（新方式） |
|------|-------------|--------------|
| **読み取り戦略** | メモリ → KV フォールバック | メモリのみ |
| **書き込み戦略** | 1分間隔で KV 書き込み | 15分間隔でバックアップ |
| **KV アクセス頻度** | 5,000〜14,000回/日 | 100回/日 |
| **レスポンス速度** | 50〜200ms | < 5ms |
| **データ保持期間** | 30日 | 7日 |
| **メモリ使用量** | < 1 MB | 3〜36 MB |

### 推奨構成

- **監視対象数**: 10〜50モニター
- **チェック間隔**: 5分
- **バックアップ間隔**: 5〜15分
- **データ保持期間**: 7日
- **クリーンアップ間隔**: 1時間

この新アプローチにより、KV の API リミット問題を解決しながら、高速で安定したサービス提供が可能になります。
