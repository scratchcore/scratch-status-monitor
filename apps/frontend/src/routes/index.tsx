import StatusPageContent from "@/components/common/status/content";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { scracsmrc } from "@scratchcore/scracsm-configs";

// Local imports
import {
  getCachedStatusAndHistory,
  fetchStatusAndHistory,
} from "@/lib/status-page/server";
import {
  STATUS_PAGE_QUERY_KEY,
} from "@/lib/status-page/config";
import {
  initializeBroadcastChannel,
  closeBroadcastChannel,
  refetchAndBroadcast,
} from "@/lib/status-page/sync";

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
      closeBroadcastChannel();
    };
  }, [queryClient]);

  const { data, isPending, error } = useQuery({
    queryKey: STATUS_PAGE_QUERY_KEY,
    queryFn: () => refetchAndBroadcast(fetchStatusAndHistory, queryClient),
    staleTime: 1000 * 60 * 5, // 5 分
    refetchInterval: (query) => {
      const currentData = query.state.data;
      if (!currentData) return false;
      const expiresAt = new Date(currentData.status.expiresAt).getTime();
      const now = Date.now();
      return Math.max(1000, expiresAt - now);
    },
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    initialData: loaderData,
  });

  if (error) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <h1 className="text-lg font-semibold text-red-900">
            エラーが発生しました
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error instanceof Error ? error.message : "不明なエラー"}
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const { status, histories } = data;
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
