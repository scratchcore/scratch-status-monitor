import { ssmrc } from "@scratchcore/ssm-configs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
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
import { buildHreflangLinks } from "@/seo/hreflang";
import { seo } from "@/seo/seo";
import { Callout } from "@/components/markdown/components/callout";

const DEFAULT_LOADER_DATA: StatusPageLoaderData = {
  histories: [],
  nextRefreshAt: Date.now(),
  refreshIntervalMs: ssmrc.cache.statusTtlMs,
};

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const { locale } = params;
    return {
      meta: seo(locale),
      links: buildHreflangLinks({ locale, path: "/" }),
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
      <div className="max-w-3xl mx-auto p-4 lg:py-8">
        {/* エラーアラート */}
        {error && (
          <Callout variant="error" title="重要なお知らせ" className="my-5">
            {error instanceof Error ? error.message : "履歴データの取得に失敗しました"}
          </Callout>
        )}

        <InfoHeader />
        <Monitors />
      </div>
    </StatusPageProvider>
  );
}
