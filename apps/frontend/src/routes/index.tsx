import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { STATUS_PAGE_QUERY_KEY } from "@/lib/status-page/config";
// Local imports
import { fetchHistories, getCachedHistories } from "@/lib/status-page/server";
import {
  closeBroadcastChannel,
  initializeBroadcastChannel,
  refetchAndBroadcast,
} from "@/lib/status-page/sync";
import { StatusPageProvider } from "@/components/common/status/layout/context";
import { StatusPageLayoutContainer } from "@/components/common/status/layout/main";
import { ssmrc } from "@scratchcore/ssm-configs";

export const Route = createFileRoute("/")({
  loader: async () => {
    return getCachedHistories();
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
    queryFn: () => refetchAndBroadcast(fetchHistories, queryClient),
    staleTime: ssmrc.cache.statusTtlMs,
    refetchInterval: (query) => {
      const currentData = query.state.data;
      if (!currentData) return false;
      return currentData.refreshIntervalMs;
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

  const { histories, nextRefreshAt, refreshIntervalMs } = data;

  console.log("Status Page Data:", data);

  return (
    <StatusPageProvider
      histories={histories}
      nextRefreshAt={nextRefreshAt}
      refreshIntervalMs={refreshIntervalMs}
    >
      <StatusPageLayoutContainer />
    </StatusPageProvider>
  );
}
