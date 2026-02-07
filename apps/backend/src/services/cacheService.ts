import { ssmrc } from "@scratchcore/ssm-configs";
import { StatusResponse, type StatusResponse as StatusResponseType } from "@scratchcore/ssm-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createLogger } from "./logger";

const logger = createLogger("CacheService");
const CACHE_KEY = "monitor:status:latest";
const CACHE_TABLE = "status_cache";

function serializeStatusResponse(data: StatusResponseType): Record<string, unknown> {
  return {
    ...data,
    timestamp: data.timestamp.toISOString(),
    expiresAt: data.expiresAt.toISOString(),
    monitors: data.monitors.map((monitor) => ({
      ...monitor,
      lastCheckedAt: monitor.lastCheckedAt.toISOString(),
    })),
  };
}

function deserializeStatusResponse(data: any): StatusResponseType {
  return StatusResponse.parse({
    ...data,
    timestamp: new Date(data.timestamp),
    expiresAt: new Date(data.expiresAt),
    monitors: (data.monitors ?? []).map((monitor: any) => ({
      ...monitor,
      lastCheckedAt: new Date(monitor.lastCheckedAt),
    })),
  });
}

export interface CacheService {
  get(): Promise<StatusResponseType | null>;
  set(data: StatusResponseType): Promise<void>;
  delete(): Promise<void>;
  restoreFromBackup(): Promise<void>; // Supabase では no-op
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
 * Supabase 対応の CacheService
 * - メモリに保持しつつ Supabase に永続化
 */
class SupabaseCacheService implements CacheService {
  private memoryCache: Map<string, { data: StatusResponseType; expiresAt: number }> = new Map();

  constructor(private client: SupabaseClient) {}

  async get(): Promise<StatusResponseType | null> {
    const memEntry = this.memoryCache.get(CACHE_KEY);
    if (memEntry && Date.now() <= memEntry.expiresAt) {
      return memEntry.data;
    }

    if (memEntry) {
      this.memoryCache.delete(CACHE_KEY);
    }

    const { data, error } = await this.client
      .from(CACHE_TABLE)
      .select("data, expires_at")
      .eq("key", CACHE_KEY)
      .maybeSingle();

    if (error) {
      logger.error("Failed to fetch cache from Supabase", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }

    if (!data) {
      return null;
    }

    const expiresAt = new Date(data.expires_at as string).getTime();
    if (Date.now() > expiresAt) {
      await this.delete();
      return null;
    }

    const revived = deserializeStatusResponse(data.data);
    this.memoryCache.set(CACHE_KEY, { data: revived, expiresAt });
    return revived;
  }

  async set(data: StatusResponseType): Promise<void> {
    const expiresAt = Date.now() + ssmrc.cache.statusTtlMs;
    this.memoryCache.set(CACHE_KEY, { data, expiresAt });

    const payload = {
      key: CACHE_KEY,
      data: serializeStatusResponse(data),
      expires_at: new Date(expiresAt).toISOString(),
    };

    const { error } = await this.client.from(CACHE_TABLE).upsert(payload, { onConflict: "key" });

    if (error) {
      logger.error("Failed to upsert cache to Supabase", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async delete(): Promise<void> {
    this.memoryCache.delete(CACHE_KEY);
    const { error } = await this.client.from(CACHE_TABLE).delete().eq("key", CACHE_KEY);
    if (error) {
      logger.error("Failed to delete cache from Supabase", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async restoreFromBackup(): Promise<void> {
    // Supabase では復元不要
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
export function initializeCacheService(client?: SupabaseClient): CacheService {
  if (cacheServiceInstance) {
    return cacheServiceInstance;
  }

  if (client) {
    cacheServiceInstance = new SupabaseCacheService(client);
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
