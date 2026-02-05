import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchHistories } from "@/lib/status-page/server";
import type { StatusPageLoaderData } from "@/lib/status-page/types";

const PAGE_SIZE = 100; // 1ページあたりの取得数

export function useHistoryPagination(initialHistories: StatusPageLoaderData["histories"], autoLoadAll = true) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["histories"],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await fetchHistories({
        limit: PAGE_SIZE,
        offset: pageParam,
      });
      return {
        histories: result.histories,
        nextOffset: pageParam + PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => {
      // hasMore が true なら次のoffsetを返す、false なら undefined で終了
      const hasMore = lastPage.histories.some((h) => h.hasMore);
      return hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    initialData: {
      pages: [
        {
          histories: initialHistories,
          nextOffset: PAGE_SIZE,
        },
      ],
      pageParams: [0],
    },
  });

  // autoLoadAll が true で hasNextPage が true なら、次ページを自動読み込み
  // ただし、既に全ページ読み込み済みかチェック
  useEffect(() => {
    if (!autoLoadAll || !hasNextPage || isFetchingNextPage) {
      return;
    }

    // 次のページを読み込む（1回のみ）
    const timer = setTimeout(() => {
      fetchNextPage();
    }, 100); // わずかな遅延で無限ループ回避

    return () => clearTimeout(timer);
  }, [autoLoadAll, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // すべてのページのデータを1つの配列に結合
  const allHistories = data?.pages.flatMap((page) => page.histories) ?? initialHistories;

  return {
    histories: allHistories,
    isLoadingMore: isFetchingNextPage,
    isLoading,
    error,
    loadMoreHistories: () => fetchNextPage(),
    hasMore: hasNextPage ?? false,
  };
}
