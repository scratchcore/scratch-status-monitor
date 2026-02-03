import { ssmrc } from "@scratchcore/ssm-configs";
import type { StatusResponse as StatusResponseType } from "@scratchcore/ssm-types";

const CACHE_KEY = "monitor:status:latest";

/**
 * Cloudflare Workers環境でKV Storeを使用するため、
 * コンテキスト経由でKV Storeにアクセスする
 * 詳細: https://developers.cloudflare.com/workers/runtime-apis/kv/
 */

export interface CacheService {
  get(): Promise<StatusResponseType | null>;
  set(data: StatusResponseType): Promise<void>;
  delete(): Promise<void>;
}

/**
 * メモリキャッシュベースのCacheService（開発用）
 * メモリ上でのみキャッシュを管理し、KVには書き込まない
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
}

/**
 * Cloudflare Workers KV Store対応のCacheService
 * メモリキャッシュで高速アクセスを提供し、
 * 一定期間ごとにKV Storeに書き込む遅延書き込みを実装
 */
class KVCacheService implements CacheService {
  private memoryCache: Map<string, { data: StatusResponseType; expiresAt: number }> = new Map();
  private lastKVWriteTime: number = 0;

  constructor(private kv: any) {}

  async get(): Promise<StatusResponseType | null> {
    // メモリキャッシュを優先的に確認
    const memEntry = this.memoryCache.get(CACHE_KEY);
    if (memEntry && Date.now() <= memEntry.expiresAt) {
      return memEntry.data;
    }

    // メモリキャッシュにない場合、KVから取得
    const kvCached = await this.kv.get(CACHE_KEY, "json");
    if (kvCached) {
      const data = kvCached as StatusResponseType;
      // メモリキャッシュに格納
      const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
      this.memoryCache.set(CACHE_KEY, { data, expiresAt });
      return data;
    }

    return null;
  }

  async set(data: StatusResponseType): Promise<void> {
    // メモリキャッシュに即座に保存
    const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
    this.memoryCache.set(CACHE_KEY, { data, expiresAt });

    // KVへの書き込みは一定期間ごとのみ実行（非同期）
    const now = Date.now();
    if (now - this.lastKVWriteTime > ssmrc.cache.kvWriteIntervalMs) {
      this.lastKVWriteTime = now;
      // バックグラウンドで書き込み（await しない）
      this.kv
        .put(CACHE_KEY, JSON.stringify(data), {
          expirationTtl: Math.ceil(ssmrc.cache.statusTtlMs / 1000),
        })
        .catch((err: Error) => {
          console.error("Failed to write cache to KV:", err);
        });
    }
  }

  async delete(): Promise<void> {
    this.memoryCache.delete(CACHE_KEY);
    await this.kv.delete(CACHE_KEY);
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
