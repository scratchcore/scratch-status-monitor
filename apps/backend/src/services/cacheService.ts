import { ssmrc } from "@scratchcore/ssm-configs";
import type { StatusResponse as StatusResponseType } from "@scratchcore/ssm-types";

const CACHE_KEY = "monitor:status:latest";
const BACKUP_KEY = "backup:cache:snapshot"; // v2.0: バックアップ用キー

/**
 * Cloudflare Workers環境でKV Storeを使用するため、
 * コンテキスト経由でKV Storeにアクセスする
 * 詳細: https://developers.cloudflare.com/workers/runtime-apis/kv/
 * 
 * v2.0: プロセスストレージ主体、KV はバックアップのみ
 */

export interface CacheService {
  get(): Promise<StatusResponseType | null>;
  set(data: StatusResponseType): Promise<void>;
  delete(): Promise<void>;
  restoreFromBackup(): Promise<void>; // v2.0: 起動時の復元
}

/**
 * メモリキャッシュベースのCacheService（開発用）
 * v2.0: メモリ上でのみキャッシュを管理、KV バックアップなし
 */
class InMemoryCacheService implements CacheService {
  private cache: Map<string, { data: StatusResponseType; expiresAt: number }> = new Map();

  async get(): Promise<StatusResponseType | null> {
    const entry = this.cache.get(CACHE_KEY);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(CACHE_KEY);
      return null;
    }

    return entry.data;
  }

  async set(data: StatusResponseType): Promise<void> {
    const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
    this.cache.set(CACHE_KEY, { data, expiresAt });
  }

  async delete(): Promise<void> {
    this.cache.delete(CACHE_KEY);
  }

  async restoreFromBackup(): Promise<void> {
    // InMemory版では何もしない
  }
}

/**
 * Cloudflare Workers KV Store対応のCacheService
 * v2.0: プロセスストレージ主体、KV はバックアップのみ
 * - メモリのみから高速取得（KV フォールバックなし）
 * - 定期的に KV へバックアップ（30分間隔）
 * - 起動時に KV から復元
 */
class KVCacheService implements CacheService {
  private memoryCache: Map<string, { data: StatusResponseType; expiresAt: number }> = new Map();
  private lastBackupTime: number = 0;
  private isRestored: boolean = false;

  constructor(private kv: any) {}

  async get(): Promise<StatusResponseType | null> {
    // v2.0: メモリのみから取得（KV アクセスなし）
    const memEntry = this.memoryCache.get(CACHE_KEY);
    if (memEntry && Date.now() <= memEntry.expiresAt) {
      return memEntry.data;
    }

    // 有効期限切れの場合は削除
    if (memEntry) {
      this.memoryCache.delete(CACHE_KEY);
    }

    return null;
  }

  async set(data: StatusResponseType): Promise<void> {
    // Step 1: メモリキャッシュに即座に保存
    const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
    this.memoryCache.set(CACHE_KEY, { data, expiresAt });

    // Step 2: KV バックアップ判定
    const now = Date.now();
    if (now - this.lastBackupTime > ssmrc.cache.kvBackupIntervalMs) {
      this.lastBackupTime = now;
      // Step 3: 非同期でバックアップ（await しない）
      this.backupToKV().catch((err: Error) => {
        console.error("Failed to backup cache to KV:", err);
      });
    }
  }

  /**
   * v2.0: KV へのバックアップ処理
   * 全データを一括で保存
   */
  private async backupToKV(): Promise<void> {
    const allData: Record<string, any> = {};
    
    for (const [key, entry] of this.memoryCache.entries()) {
      allData[key] = {
        data: entry.data,
        expiresAt: entry.expiresAt,
      };
    }

    await this.kv.put(BACKUP_KEY, JSON.stringify(allData), {
      expirationTtl: ssmrc.cache.dataRetentionDays * 24 * 60 * 60, // 7日
    });

    console.log(`[CacheService] Backup completed: ${Object.keys(allData).length} entries`);
  }

  /**
   * v2.0: 起動時に KV から復元
   */
  async restoreFromBackup(): Promise<void> {
    if (this.isRestored) {
      return; // 既に復元済み
    }

    try {
      const backup = await this.kv.get(BACKUP_KEY, "json");
      if (backup) {
        let restoredCount = 0;
        for (const [key, entry] of Object.entries(backup as Record<string, any>)) {
          // 有効期限が切れていないデータのみ復元
          if (entry.expiresAt && Date.now() <= entry.expiresAt) {
            this.memoryCache.set(key, {
              data: entry.data,
              expiresAt: entry.expiresAt,
            });
            restoredCount++;
          }
        }
        console.log(`[CacheService] Restored from backup: ${restoredCount} entries`);
      } else {
        console.log("[CacheService] No backup found in KV");
      }
    } catch (err) {
      console.error("[CacheService] Failed to restore from backup:", err);
    } finally {
      this.isRestored = true;
    }
  }

  async delete(): Promise<void> {
    this.memoryCache.delete(CACHE_KEY);
    // バックアップは保持（v2.0: 復元用に残す）
  }
}

/**
 * Cacheサービスのシングルトンインスタンス
 */
let cacheServiceInstance: CacheService | null = null;

/**
 * CacheServiceを初期化または取得
 * @param kv Cloudflare Workers KVオブジェクト（オプション）
 */
export function initializeCacheService(kv?: any): CacheService {
  if (cacheServiceInstance) {
    return cacheServiceInstance;
  }

  if (kv) {
    cacheServiceInstance = new KVCacheService(kv);
  } else {
    // 開発環境ではメモリキャッシュを使用
    cacheServiceInstance = new InMemoryCacheService();
  }

  return cacheServiceInstance;
}

/**
 * CacheServiceインスタンスを取得
 */
export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new InMemoryCacheService();
  }
  return cacheServiceInstance;
}
