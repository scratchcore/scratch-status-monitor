import { createServerFn } from "@tanstack/react-start";
import { ssmrc } from "@scratchcore/ssm-configs";
import type { HistoryApiEnvelope, StatusPageLoaderData } from "./types";
import { getEnv } from "@/plugins/envrc";

/**
 * Server Function: サーバーサイドでバックエンドAPIから履歴データ取得（段階的）
 */
const fetchHistoriesServerFn = createServerFn({ method: "GET" })
  .inputValidator((data?: { limit?: number; offset?: number }) => data ?? {})
  .handler(
    async ({ data }): Promise<StatusPageLoaderData> => {
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
  },
);

export const fetchHistories = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<StatusPageLoaderData> => {
  return fetchHistoriesServerFn({ data: params });
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

  // バックエンドから取得
  inFlightRequest = fetchHistories()
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
