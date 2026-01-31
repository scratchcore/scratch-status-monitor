import type { StatusResponse } from "../schemas/status";

const CACHE_KEY = "monitor:status:latest";
const CACHE_TTL = 5 * 60; // 5分（秒）

/**
 * Cloudflare Workers環境でKV Storeを使用するため、
 * コンテキスト経由でKV Storeにアクセスする
 * 詳細: https://developers.cloudflare.com/workers/runtime-apis/kv/
 */

export interface CacheService {
  get(): Promise<StatusResponse | null>;
  set(data: StatusResponse): Promise<void>;
  delete(): Promise<void>;
}

/**
 * メモリキャッシュベースのCacheService（開発用）
 * 本番ではKV Storeに置き換え
 */
class InMemoryCacheService implements CacheService {
  private cache: Map<string, { data: StatusResponse; expiresAt: number }> = new Map();

  async get(): Promise<StatusResponse | null> {
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

  async set(data: StatusResponse): Promise<void> {
    const expiresAt = Date.now() + CACHE_TTL * 1000;
    this.cache.set(CACHE_KEY, { data, expiresAt });
  }

  async delete(): Promise<void> {
    this.cache.delete(CACHE_KEY);
  }
}

/**
 * Cloudflare Workers KV Store対応のCacheService
 */
class KVCacheService implements CacheService {
  constructor(private kv: any) {}

  async get(): Promise<StatusResponse | null> {
    const cached = await this.kv.get(CACHE_KEY, "json");
    return cached ? (cached as StatusResponse) : null;
  }

  async set(data: StatusResponse): Promise<void> {
    await this.kv.put(CACHE_KEY, JSON.stringify(data), {
      expirationTtl: CACHE_TTL,
    });
  }

  async delete(): Promise<void> {
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
