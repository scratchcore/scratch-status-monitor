import { RiCheckboxCircleFill, RiErrorWarningFill, RiSettings5Fill } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { cx } from "@/lib/utils";
import { buildMemoryTrackData, formatDateTime } from "./data";
import {
  type colorMapping,
  colorSlugMapping,
  type HistoryResponse,
  type StatusResponse,
  statusLabel,
  statusToTooltip,
} from "./rc";
import { Tracker } from "./tracker";

const StatusIcon = ({
  tooltip,
  className,
}: {
  tooltip: keyof typeof colorMapping;
  className?: string;
}) => {
  if (tooltip === "Operational") {
    return (
      <RiCheckboxCircleFill
        className={className ?? "size-5 shrink-0 text-emerald-500"}
        aria-hidden={true}
      />
    );
  }
  if (tooltip === "Maintenance") {
    return (
      <RiSettings5Fill
        className={className ?? "size-5 shrink-0 text-amber-500"}
        aria-hidden={true}
      />
    );
  }
  if (tooltip === "Downtime") {
    return (
      <RiErrorWarningFill
        className={className ?? "size-5 shrink-0 text-red-500"}
        aria-hidden={true}
      />
    );
  }
  return null;
};

export default function StatusPageContent({
  status,
  histories,
  nextRefreshAt,
  refreshIntervalMs,
}: {
  status: StatusResponse;
  histories: HistoryResponse[];
  nextRefreshAt?: number;
  refreshIntervalMs?: number;
}) {
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!nextRefreshAt) {
      return null;
    }
    return Math.max(0, nextRefreshAt - Date.now());
  });

  useEffect(() => {
    if (!nextRefreshAt) {
      return undefined;
    }
    setRemainingMs(Math.max(0, nextRefreshAt - Date.now()));
    const timer = setInterval(() => {
      setRemainingMs(Math.max(0, nextRefreshAt - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextRefreshAt]);

  const formattedRemaining = useMemo(() => {
    if (remainingMs === null) {
      return null;
    }
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingMs]);

  const refreshHint = useMemo(() => {
    if (!refreshIntervalMs) {
      return null;
    }
    const minutes = Math.round(refreshIntervalMs / 60000);
    return `${minutes}分ごとに自動更新`;
  }, [refreshIntervalMs]);
  const overallTooltip = statusToTooltip[status.overallStatus];
  const colorSlug = colorSlugMapping[overallTooltip];

  return (
    <>
      <div className="flex flex-col items-center">
        <span
          className={cx(
            "mx-auto inline-flex items-center justify-center rounded-full",
            `bg-${colorSlug}-100 dark:bg-${colorSlug}-400/20 dark:to-${colorSlug}-500/10`,
          )}
        >
          <StatusIcon tooltip={overallTooltip} className={`h-10 w-10 text-${colorSlug}-500`} />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-50">
          全体ステータス: {statusLabel[status.overallStatus]}
        </h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          最終更新: {formatDateTime(status.timestamp)}
        </p>
        {formattedRemaining ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            次回更新まで: {formattedRemaining}
            {refreshHint ? `（${refreshHint}）` : ""}
          </p>
        ) : null}
      </div>
      <div className="relative w-full rounded-lg border p-6 text-left shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-900 mt-10 space-y-6">
        {status.monitors.map((monitor, index) => {
          const history = histories.find((item) => item.monitorId === monitor.id);
          const desktopData = buildMemoryTrackData(history?.records, 90);
          const tabletData = buildMemoryTrackData(history?.records, 60);
          const mobileData = buildMemoryTrackData(history?.records, 30);
          const monitorTooltip = statusToTooltip[monitor.status];
          return (
            <div key={monitor.id} className="space-y-4">
              <div>
                <p className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
                  <span className="flex items-center gap-2 font-medium">
                    <StatusIcon tooltip={monitorTooltip} />
                    <span className="text-gray-900 dark:text-gray-50">{monitor.label}</span>
                  </span>
                  <span className="text-gray-900 dark:text-gray-50">
                    {statusLabel[monitor.status]}
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
                  <span>{monitor.category}</span>
                  <span>応答時間: {monitor.responseTime ? `${monitor.responseTime}ms` : "-"}</span>
                  <span>最終チェック: {formatDateTime(monitor.lastCheckedAt)}</span>
                  {monitor.errorMessage ? (
                    <span className="text-red-500">{monitor.errorMessage}</span>
                  ) : null}
                </div>
                <Tracker hoverEffect data={desktopData} className="mt-3 hidden w-full lg:flex" />
                <Tracker
                  hoverEffect
                  data={tabletData}
                  className="mt-3 hidden w-full sm:flex lg:hidden"
                />
                <Tracker hoverEffect data={mobileData} className="mt-3 flex w-full sm:hidden" />
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                  <span>7日前</span>
                  <span>今日</span>
                </div>
              </div>
              {index < status.monitors.length - 1 ? (
                <div className="h-px w-full bg-gray-200 dark:bg-gray-800" aria-hidden={true} />
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
