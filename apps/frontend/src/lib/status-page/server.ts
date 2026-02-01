import { createServerFn } from "@tanstack/react-start";
import {
  StatusPageLoaderData,
  StatusApiEnvelope,
  HistoryApiEnvelope,
} from "./types";
import { getBackendBaseUrl } from "./config";

/**
 * Server Function: サーバーサイドでバックエンドAPIからデータ取得
 * クライアントから呼び出されても、実行はサーバー側で行われる
 */
const fetchStatusAndHistoryServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<StatusPageLoaderData> => {
    const baseUrl = getBackendBaseUrl();
    const [statusResponse, historyResponse] = await Promise.all([
      fetch(`${baseUrl}/status`, {
        headers: {
          accept: "application/json",
        },
      }),
      fetch(`${baseUrl}/history?limit=90`, {
        headers: {
          accept: "application/json",
        },
      }),
    ]);

    if (!statusResponse.ok) {
      throw new Error("ステータスの取得に失敗しました");
    }

    if (!historyResponse.ok) {
      throw new Error("履歴の取得に失敗しました");
    }

    const statusJson = (await statusResponse.json()) as StatusApiEnvelope;
    const historyJson = (await historyResponse.json()) as HistoryApiEnvelope;

    return {
      status: statusJson.data,
      histories: historyJson.data,
    };
  },
);

export const fetchStatusAndHistory = async (): Promise<StatusPageLoaderData> => {
  return fetchStatusAndHistoryServerFn();
};

// サーバーサイドのメモリキャッシュ（複数リクエスト間で共有）
let cachedLoaderData: StatusPageLoaderData | null = null;
let inFlightRequest: Promise<StatusPageLoaderData> | null = null;

/**
 * SSRローダー用：サーバーサイドのメモリキャッシュを優先的に使用
 */
export const getCachedStatusAndHistory = async (): Promise<StatusPageLoaderData> => {
  const now = Date.now();

  // キャッシュが有効な場合はそれを返す（expiresAt ベースで判定）
  if (cachedLoaderData) {
    const expiresAt = new Date(cachedLoaderData.status.expiresAt).getTime();
    if (now < expiresAt) {
      return cachedLoaderData;
    }
  }

  // 既に取得中の場合は待機
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // バックエンドから取得
  inFlightRequest = fetchStatusAndHistory()
    .then((data) => {
      cachedLoaderData = data;
      inFlightRequest = null;
      return data;
    })
    .catch((error) => {
      inFlightRequest = null;
      throw error;
    });

  return inFlightRequest;
};
