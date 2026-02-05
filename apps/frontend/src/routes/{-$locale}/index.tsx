import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useIntlayer } from "react-intlayer";
import { STATUS_PAGE_QUERY_KEY } from "@/lib/status-page/config";
// Local imports
import { getCachedHistories } from "@/lib/status-page/server";
import {
  closeBroadcastChannel,
  initializeBroadcastChannel,
  refetchAndBroadcast,
} from "@/lib/status-page/sync";
import { StatusPageProvider } from "@/components/common/status/layout/context";
import { StatusPageSkeleton } from "@/components/common/status/layout/skeleton";
import { ssmrc } from "@scratchcore/ssm-configs";
import { seo } from "@/utils/seo";
import { InfoHeader } from "@/components/common/status/layout/info-header";
import { Monitors } from "@/components/common/status/layout/monitors";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/{-$locale}/")({
  head: ({ params }) => {
    const { locale } = params;
    return {
      meta: { ...seo(locale) },
    };
  },
  loader: async () => {
    return getCachedHistories();
  },
  component: App,
});

function App() {
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();
  const t = useIntlayer("status");

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

  if (error) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <h1 className="text-lg font-semibold text-red-900">
            {t.error.title}
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error instanceof Error ? error.message : t.error.unknown}
          </p>
        </div>
      </div>
    );
  }

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
        <InfoHeader />
        <Monitors />
        <Footer />
      </div>
    </StatusPageProvider>
  );
}
