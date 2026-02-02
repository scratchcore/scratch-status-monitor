import { useContext } from "react";
import { formatDateTime } from "../data";
import { type colorMapping, statusLabel } from "../rc";
import { Tracker } from "../ui/tracker";
import { StatusCardContext } from "./context";
import { StatusIcon } from "../icon";

export function StatusCard({
  monitorTooltip,
}: {
  monitorTooltip: keyof typeof colorMapping;
}) {
  const data = useContext(StatusCardContext);
  if (!data) return null;

  return (
    <div key={data.monitor.id} className="space-y-4">
      <div>
        <p className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-2 font-medium">
            <StatusIcon tooltip={monitorTooltip} />
            <span className="text-gray-900 dark:text-gray-50">
              {data.monitor.label}
            </span>
          </span>
          <span className="text-gray-900 dark:text-gray-50">
            {statusLabel[data.monitor.status]}
          </span>
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span>
            応答時間:{" "}
            {data.monitor.responseTime ? `${data.monitor.responseTime}ms` : "-"}
          </span>
          <span>最終チェック: {formatDateTime(data.monitor.recordedAt)}</span>
          {data.monitor.errorMessage ? (
            <span className="text-red-500">{data.monitor.errorMessage}</span>
          ) : null}
        </div>
        <Tracker
          hoverEffect
          data={data.data.desktop}
          className="mt-3 hidden w-full lg:flex"
        />
        <Tracker
          hoverEffect
          data={data.data.tablet}
          className="mt-3 hidden w-full sm:flex lg:hidden"
        />
        <Tracker
          hoverEffect
          data={data.data.mobile}
          className="mt-3 flex w-full sm:hidden"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <span>7日前</span>
          <span>今日</span>
        </div>
      </div>
      <div
        className="h-px w-full bg-gray-200 dark:bg-gray-800"
        aria-hidden={true}
      />
    </div>
  );
}
