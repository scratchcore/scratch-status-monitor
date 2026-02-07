import { CACHE_KEY, STATUS_PAGE_QUERY_KEY } from "./config";
import { fetchAllHistories } from "./server";
import type { StatusPageLoaderData } from "./types";

// クライアントサイドの BroadcastChannel（複数タブ間で同期）
let broadcastChannel: BroadcastChannel | null = null;

import type { QueryClient } from "@tanstack/react-query";

/**
 * BroadcastChannel を初期化して複数タブ間でキャッシュを同期
 */
export const initializeBroadcastChannel = (queryClient: QueryClient): void => {
  if (typeof window === "undefined" || broadcastChannel) {
    return;
  }

  try {
    broadcastChannel = new BroadcastChannel(CACHE_KEY);

    broadcastChannel.onmessage = (event) => {
      if (event.data.type === "cache-updated") {
        // 他のタブがキャッシュを更新したので、このタブも更新
        queryClient.setQueryData(STATUS_PAGE_QUERY_KEY, event.data.payload);
      }
    };
  } catch (_e) {
    // BroadcastChannel が使用不可の環境では何もしない
    console.warn("BroadcastChannel not available");
  }
};

/**
 * BroadcastChannel を閉じる
 */
export const closeBroadcastChannel = (): void => {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
};

/**
 * 新しいデータを取得して、他のタブに通知（全データ取得版）
 */
export const refetchAndBroadcast = async (
  queryClient: QueryClient
): Promise<StatusPageLoaderData> => {
  const newData = await fetchAllHistories();

  // クライアント側のキャッシュも更新
  queryClient.setQueryData(STATUS_PAGE_QUERY_KEY, newData);

  // 他のタブに通知
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: "cache-updated",
      payload: newData,
    });
  }

  return newData;
};
