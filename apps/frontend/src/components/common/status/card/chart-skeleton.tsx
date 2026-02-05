import { Skeleton } from "@/components/ui/skeleton";

/**
 * チャートのスケルトン表示
 */
export function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Y軸ラベル */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-4 w-12" />
        <div className="flex flex-1 items-end gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-12 flex-1" />
          ))}
        </div>
      </div>

      {/* X軸ラベル */}
      <div className="flex justify-between px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  );
}
