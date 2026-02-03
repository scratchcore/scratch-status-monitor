import { useContext } from "react";
import { StatusPageContext } from "./context";
import { buildMemoryTrackData } from "../data";
import { statusToTooltip } from "../rc";
import { StatusCardProvider } from "../card/context";
import { StatusCard } from "../card";

export function Monitors() {
  const s = useContext(StatusPageContext);
  if (!s) return null;
  const { histories } = s;

  if (!histories || histories.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full rounded-lg border p-6 text-left shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-900 mt-10 space-y-6">
      {histories.map((history) => {
        const monitorRecords = history.records;
        const desktopData = buildMemoryTrackData(monitorRecords, 90);
        const tabletData = buildMemoryTrackData(monitorRecords, 60);
        const mobileData = buildMemoryTrackData(monitorRecords, 30);

        // 最新のレコードを取得
        const latestRecord = monitorRecords[monitorRecords.length - 1];
        if (!latestRecord) return null;

        const monitorTooltip = statusToTooltip[latestRecord.status];
        const monitorWithLabel = {
          ...latestRecord,
          label: history.label,
        };

        return (
          <StatusCardProvider
            key={history.monitorId}
            value={{
              monitor: monitorWithLabel,
              uptimePercent: history.stats.uptime,
              data: {
                row: monitorRecords,
                desktop: desktopData,
                tablet: tabletData,
                mobile: mobileData,
              },
            }}
          >
            <StatusCard monitorTooltip={monitorTooltip} />
          </StatusCardProvider>
        );
      })}
    </div>
  );
}
