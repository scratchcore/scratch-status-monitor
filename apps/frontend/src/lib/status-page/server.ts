import { ssmrc } from "@scratchcore/ssm-configs";
import { createServerFn } from "@tanstack/react-start";
import { getEnv } from "@/plugins/envrc";
import type { HistoryApiEnvelope, StatusPageLoaderData } from "./types";

const FETCH_TIMEOUT_MS = 30000; // 30秒

/**
 * Server Function: サーバーサイドでバックエンドAPIから履歴データ取得（段階的）
 */
const fetchHistoriesServerFn = createServerFn({ method: "GET" })
  .inputValidator((data?: { limit?: number; offset?: number }) => data ?? {})
  .handler(async ({ data }): Promise<StatusPageLoaderData> => {
    const env = getEnv();
    const { VITE_BACKEND_URL: baseUrl, API_TOKEN } = env;

    const limit = data?.limit ?? 100;
    const offset = data?.offset ?? 0;

    const url = `${baseUrl}/history?limit=${limit}&offset=${offset}`;

    console.log("[fetchHistoriesServerFn] リクエスト開始:", {
      url,
      timestamp: new Date().toISOString(),
    });

    const startTime = performance.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const historyResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json",
          authorization: `Bearer ${API_TOKEN}`,
        },
      });

      const elapsed = performance.now() - startTime;

      console.log("[fetchHistoriesServerFn] レスポンス受信:", {
        status: historyResponse.status,
        statusText: historyResponse.statusText,
        url: historyResponse.url,
        elapsed: `${elapsed.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });

      if (!historyResponse.ok) {
        let errorMessage = `HTTPエラー: ${historyResponse.status} ${historyResponse.statusText}`;
        try {
          const errorBody = await historyResponse.text();
          if (errorBody) {
            errorMessage += `\nレスポンス本体: ${errorBody}`;
          }
        } catch {
          // レスポンス読み込み失敗は無視
        }

        console.error("[fetchHistoriesServerFn] リクエスト失敗:", {
          status: historyResponse.status,
          statusText: historyResponse.statusText,
          url: historyResponse.url,
          elapsed: `${elapsed.toFixed(2)}ms`,
          headers: Object.fromEntries(historyResponse.headers.entries()),
          message: errorMessage,
        });

        throw new Error(errorMessage);
      }

      const historyJson = (await historyResponse.json()) as HistoryApiEnvelope;

      console.log("[fetchHistoriesServerFn] データ取得成功:", {
        recordCount: historyJson.data?.length ?? 0,
        elapsed: `${elapsed.toFixed(2)}ms`,
      });

      // 次回更新予定時刻を計算
      const now = Date.now();
      const nextRefreshAt = now + ssmrc.cache.statusTtlMs;

      return {
        histories: historyJson.data,
        nextRefreshAt,
        refreshIntervalMs: ssmrc.cache.statusTtlMs,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      const elapsed = performance.now() - startTime;

      if (error instanceof DOMException && error.name === "AbortError") {
        const message = `[fetchHistoriesServerFn] タイムアウト: ${FETCH_TIMEOUT_MS}ms以内にレスポンスがありません`;
        console.error(message, { elapsed: `${elapsed.toFixed(2)}ms` });
        throw new Error(
          `バックエンドが応答しません (タイムアウト: ${(FETCH_TIMEOUT_MS / 1000).toFixed(0)}秒)。バックエンドのCPU使用率を確認してください。`
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  });

export const fetchHistories = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<StatusPageLoaderData> => {
  return fetchHistoriesServerFn({ data: params });
};

/**
 * すべての履歴データを取得（hasMore が false になるまで繰り返し取得）
 */
export const fetchAllHistories = async (): Promise<StatusPageLoaderData> => {
  const PAGE_SIZE = 100;
  let offset = 0;
  const historiesMap = new Map<string, StatusPageLoaderData["histories"][number]>();
  let hasMore = true;

  while (hasMore) {
    const result = await fetchHistories({ limit: PAGE_SIZE, offset });

    // モニターIDごとにレコードをマージ
    for (const history of result.histories) {
      const existing = historiesMap.get(history.monitorId);
      if (existing) {
        // 既存のレコードに新しいレコードを追加
        existing.records.push(...history.records);
        existing.hasMore = history.hasMore;
        // 統計情報も更新（最新のものを使用）
        existing.stats = history.stats;
        existing.totalRecords = history.totalRecords;
        existing.oldestRecord = history.oldestRecord;
        existing.newestRecord = history.newestRecord;
      } else {
        historiesMap.set(history.monitorId, history);
      }
    }

    // すべてのモニターで hasMore が false なら終了
    hasMore = Array.from(historiesMap.values()).some((h) => h.hasMore);
    offset += PAGE_SIZE;

    // 安全装置：最大10ページまで（1000レコード）
    if (offset >= PAGE_SIZE * 10) {
      console.warn("Maximum page limit reached (10 pages)");
      break;
    }
  }

  // モニターごとにレコードを重複排除・ソートして整形
  for (const history of historiesMap.values()) {
    const seen = new Set<string>();
    const deduped = history.records.filter((record) => {
      if (seen.has(record.id)) {
        return false;
      }
      seen.add(record.id);
      return true;
    });

    deduped.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    history.records = deduped;
    history.oldestRecord = deduped[0]?.recordedAt;
    history.newestRecord = deduped[deduped.length - 1]?.recordedAt;
  }

  const now = Date.now();

  return {
    histories: Array.from(historiesMap.values()),
    nextRefreshAt: now + ssmrc.cache.statusTtlMs,
    refreshIntervalMs: ssmrc.cache.statusTtlMs,
  };
};

// サーバーサイドのメモリキャッシュ（複数リクエスト間で共有）
let cachedLoaderData: StatusPageLoaderData | null = null;
let inFlightRequest: Promise<StatusPageLoaderData> | null = null;
let cacheExpireTime: number = 0;

/**
 * SSRローダー用：サーバーサイドのメモリキャッシュを優先的に使用
 */
export const getCachedHistories = async (): Promise<StatusPageLoaderData> => {
  const now = Date.now();

  // キャッシュが有効な場合はそれを返す
  if (cachedLoaderData && now < cacheExpireTime) {
    return cachedLoaderData;
  }

  // 既に取得中の場合は待機
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // バックエンドから全データ取得
  inFlightRequest = fetchAllHistories()
    .then((data) => {
      cachedLoaderData = data;
      cacheExpireTime = now + data.refreshIntervalMs;
      inFlightRequest = null;
      return data;
    })
    .catch((error) => {
      inFlightRequest = null;
      throw error;
    });

  return inFlightRequest;
};

const fetchCachedHistoriesServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<StatusPageLoaderData> => getCachedHistories()
);

export const fetchCachedHistories = async (): Promise<StatusPageLoaderData> => {
  return fetchCachedHistoriesServerFn();
};
