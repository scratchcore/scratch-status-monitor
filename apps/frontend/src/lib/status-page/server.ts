import { createServerFn } from "@tanstack/react-start";
import { ssmrc } from "@scratchcore/ssm-configs";
import type { HistoryApiEnvelope, StatusPageLoaderData } from "./types";
import { getEnv } from "@/plugins/envrc";

/**
 * Server Function: サーバーサイドでバックエンドAPIから履歴データ取得（段階的）
 */
const fetchHistoriesServerFn = createServerFn({ method: "GET" })
  .inputValidator((data?: { limit?: number; offset?: number }) => data ?? {})
  .handler(async ({ data }): Promise<StatusPageLoaderData> => {
    const env = getEnv({ throwOnError: true });
    const { VITE_BACKEND_URL: baseUrl, API_TOKEN } = env;

    const limit = data?.limit ?? 100;
    const offset = data?.offset ?? 0;

    const historyResponse = await fetch(
      `${baseUrl}/history?limit=${limit}&offset=${offset}`,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${API_TOKEN}`,
        },
      },
    );

    if (!historyResponse.ok) {
      throw new Error("履歴の取得に失敗しました");
    }

    const historyJson = (await historyResponse.json()) as HistoryApiEnvelope;

    // 次回更新予定時刻を計算
    const now = Date.now();
    const nextRefreshAt = now + ssmrc.cache.statusTtlMs;

    return {
      histories: historyJson.data,
      nextRefreshAt,
      refreshIntervalMs: ssmrc.cache.statusTtlMs,
    };
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
  const historiesMap = new Map<
    string,
    StatusPageLoaderData["histories"][number]
  >();
  let hasMore = true;

  let a = 0;
  let b = 0;

  while (hasMore) {
    const result = await fetchHistories({ limit: PAGE_SIZE, offset });

    // モニターIDごとにレコードをマージ
    for (const history of result.histories) {
      a += history.records.length;
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

    deduped.sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

    b += deduped.length;

    history.records = deduped;
    history.oldestRecord = deduped[0]?.recordedAt;
    history.newestRecord = deduped[deduped.length - 1]?.recordedAt;
  }

  console.log("Total records fetched:", a);
  console.log("Total records after deduplication:", b);

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
