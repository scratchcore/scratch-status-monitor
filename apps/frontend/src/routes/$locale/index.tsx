import { ssmrc } from "@scratchcore/ssm-configs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { StatusPageProvider } from "@/components/common/status/layout/context";
import { InfoHeader } from "@/components/common/status/layout/info-header";
import { Monitors } from "@/components/common/status/layout/monitors";
import { StatusPageSkeleton } from "@/components/common/status/layout/skeleton";
import { STATUS_PAGE_QUERY_KEY } from "@/lib/status-page/config";
// Local imports
import { getCachedHistories } from "@/lib/status-page/server";
import {
  closeBroadcastChannel,
  initializeBroadcastChannel,
  refetchAndBroadcast,
} from "@/lib/status-page/sync";
import type { StatusPageLoaderData } from "@/lib/status-page/types";
import { seo } from "@/utils/seo";

const DEFAULT_LOADER_DATA: StatusPageLoaderData = {
  histories: [],
  nextRefreshAt: Date.now(),
  refreshIntervalMs: ssmrc.cache.statusTtlMs,
};

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const { locale } = params;
    return {
      meta: { ...seo(locale) },
    };
  },
  loader: async () => {
    try {
      return await getCachedHistories();
    } catch (error) {
      console.error(
        "[Status Page Loader] 履歴の取得に失敗しました:",
        error instanceof Error ? error.message : String(error),
        error
      );
      // デフォルトデータを返してアプリを続行
      return DEFAULT_LOADER_DATA;
    }
  },
  component: App,
  onEnter: () => {
    window.scrollTo(0, 0);
  },
});

function App() {
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();
  const _t = useIntlayer("status");

  // BroadcastChannel を初期化
  useEffect(() => {
    initializeBroadcastChannel(queryClient);

    return () => {
      closeBroadcastChannel();
    };
  }, [queryClient]);

  const { data, isPending, error } = useQuery({
    queryKey: STATUS_PAGE_QUERY_KEY,
    queryFn: () => refetchAndBroadcast(queryClient),
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

  const [dismissedError, setDismissedError] = useState(false);

  if (isPending) {
    return <StatusPageSkeleton />;
  }

  const { histories, nextRefreshAt, refreshIntervalMs } = data;

  return (
    <StatusPageProvider
      histories={histories}
      nextRefreshAt={nextRefreshAt}
      refreshIntervalMs={refreshIntervalMs}
    >
      <div className="max-w-3xl pt-20 mx-auto">
        {/* エラーアラート */}
        {error && !dismissedError && (
          <div className="mb-4 flex gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <div className="shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">データ取得エラー</h3>
              <p className="mt-1 text-sm text-yellow-700">
                {error instanceof Error ? error.message : "履歴データの取得に失敗しました"}
              </p>
            </div>
            <button
              onClick={() => setDismissedError(true)}
              className="shrink-0 text-yellow-400 hover:text-yellow-500"
            >
              ✕
            </button>
          </div>
        )}

        <InfoHeader />
        <Monitors />
      </div>
    </StatusPageProvider>
  );
}
