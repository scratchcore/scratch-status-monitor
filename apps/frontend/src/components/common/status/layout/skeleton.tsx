import { Skeleton } from "@/components/ui/skeleton";

/**
 * InfoHeader のスケルトン表示
 */
export function InfoHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center">
      {/* ステータスアイコン */}
      <Skeleton className="h-10 w-10 rounded-full" />
      
      {/* タイトル */}
      <Skeleton className="mt-3 h-7 w-48" />
      
      {/* ステータステキスト */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

/**
 * モニターカードのスケルトン表示
 */
export function MonitorCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-[#090E1A] p-4">
      {/* ヘッダー：アイコン + ラベル + uptime */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      {/* ステータス情報 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* トラッカー（デスクトップ） */}
      <div className="hidden space-y-1 lg:block">
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton key={i} className="h-1 flex-1" />
          ))}
        </div>
      </div>

      {/* トラッカー（タブレット） */}
      <div className="hidden space-y-1 sm:block lg:hidden">
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-1 flex-1" />
          ))}
        </div>
      </div>

      {/* トラッカー（モバイル） */}
      <div className="block space-y-1 sm:hidden">
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-1 flex-1" />
          ))}
        </div>
      </div>

      {/* 日付ラベル */}
      <div className="flex justify-between text-sm">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Accordion */}
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
}

/**
 * モニター一覧のスケルトン表示
 */
export function MonitorsContainerSkeleton({
  monitorCount = 8,
}: {
  monitorCount?: number;
}) {
  return (
    <div className="relative mt-10 w-full space-y-6 rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm dark:border-gray-900 dark:bg-[#090E1A]">
      {Array.from({ length: monitorCount }).map((_, i) => (
        <MonitorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 全体的なページスケルトン表示
 */
export function StatusPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl py-20">
      <InfoHeaderSkeleton />
      <MonitorsContainerSkeleton monitorCount={8} />
    </div>
  );
}
