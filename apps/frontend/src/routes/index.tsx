import StatusPageContent from "@/components/common/status/content";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import type { SerializedInfer } from "@scratchcore/scracsm-types";
import {
  StatusResponse as StatusResponseSchema,
  HistoryResponse as HistoryResponseSchema,
} from "@scratchcore/scracsm-types";
import { scracsmrc } from "@scratchcore/scracsm-configs";

// シリアライズされた型（API レスポンス用）
type StatusResponse = SerializedInfer<typeof StatusResponseSchema> & {
  expiresAt: string;
};
type HistoryResponse = SerializedInfer<typeof HistoryResponseSchema>;

type StatusApiEnvelope = {
  success: boolean;
  data: StatusResponse;
  message?: string;
};

type HistoryApiEnvelope = {
  success: boolean;
  data: HistoryResponse[];
  message?: string;
};

type StatusPageLoaderData = {
  status: StatusResponse;
  histories: HistoryResponse[];
};

const CACHE_KEY = "status-page-cache";

// サーバーサイドのメモリキャッシュ（複数リクエスト間で共有）
let cachedLoaderData: StatusPageLoaderData | null = null;
let inFlightRequest: Promise<StatusPageLoaderData> | null = null;

// クライアントサイドの BroadcastChannel（複数タブ間で同期）
let broadcastChannel: BroadcastChannel | null = null;

const STATUS_PAGE_QUERY_KEY = ["status-page", "status-history"];

const getBackendBaseUrl = () => {
  const fromVite = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const fromNode =
    typeof process !== "undefined"
      ? (process.env.VITE_BACKEND_URL as string | undefined)
      : undefined;
  return fromVite || fromNode || "http://127.0.0.1:8787";
};

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

const fetchStatusAndHistory = async (): Promise<StatusPageLoaderData> => {
  return fetchStatusAndHistoryServerFn();
};

/**
 * SSRローダー用：サーバーサイドのメモリキャッシュを優先的に使用
 */
const getCachedStatusAndHistory = async (): Promise<StatusPageLoaderData> => {
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

/**
 * BroadcastChannel を初期化して複数タブ間でキャッシュを同期
 */
const initializeBroadcastChannel = (queryClient: any) => {
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
  } catch (e) {
    // BroadcastChannel が使用不可の環境では何もしない
    console.warn("BroadcastChannel not available");
  }
};

/**
 * 新しいデータを取得して、他のタブに通知
 */
const refetchAndBroadcast = async (queryClient: any) => {
  const newData = await fetchStatusAndHistory();

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

export const Route = createFileRoute("/")({
  loader: async () => {
    return getCachedStatusAndHistory();
  },
  component: App,
});

function App() {
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();

  // BroadcastChannel を初期化
  useEffect(() => {
    initializeBroadcastChannel(queryClient);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
      }
    };
  }, [queryClient]);

  const { data } = useQuery({
    queryKey: STATUS_PAGE_QUERY_KEY,
    queryFn: () => refetchAndBroadcast(queryClient),
    staleTime: Infinity,
    refetchInterval: (query) => {
      const currentData = query.state.data;
      if (!currentData) return false;
      const expiresAt = new Date(currentData.status.expiresAt).getTime();
      const now = Date.now();
      return Math.max(1000, expiresAt - now);
    },
    refetchOnWindowFocus: false,
    initialData: loaderData,
  });

  const { status, histories } = data;
  // サーバーの expiresAt をベースに次回更新時刻を計算（全ユーザーで統一）
  const nextRefreshAt = new Date(status.expiresAt).getTime();

  return (
    <div className="min-h-screen">
      <section className="py-20 max-w-3xl mx-auto">
        <StatusPageContent
          status={status}
          histories={histories}
          nextRefreshAt={nextRefreshAt}
          refreshIntervalMs={scracsmrc.cache.statusTtlMs}
        />
      </section>
    </div>
  );
}
