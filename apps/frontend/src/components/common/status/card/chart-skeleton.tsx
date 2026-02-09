import { Skeleton } from "@/components/ui/skeleton";

/**
 * チャートのスケルトン表示
 */
export function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Y軸ラベル */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-30 w-5 mr-1 mb-auto" />
        <Skeleton className="h-56 w-full" />
      </div>

      {/* X軸ラベル */}
      <div className="flex gap-1 justify-between px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  );
}
