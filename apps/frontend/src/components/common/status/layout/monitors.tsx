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

  // 最新のレコードを取得
  const latestHistory = histories[0];
  if (!latestHistory.records || latestHistory.records.length === 0) {
    return null;
  }

  // monitorIdでグループ化してモニターデータを構築
  const monitorMap = new Map<string, typeof latestHistory.records>();

  histories.forEach((history) => {
    if (!history.records) return;
    history.records.forEach((record) => {
      if (!monitorMap.has(record.monitorId)) {
        monitorMap.set(record.monitorId, []);
      }
      monitorMap.get(record.monitorId)?.push(record);
    });
  });

  // 各monitorIdごとにユニークなレコードを取得（重複を除去）
  const uniqueMonitors = Array.from(monitorMap.entries()).map(
    ([_, records]) => {
      // 最新のレコードを取得（配列の最後）
      return records[records.length - 1];
    },
  );

  return (
    <div className="relative w-full rounded-lg border p-6 text-left shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-900 mt-10 space-y-6">
      {uniqueMonitors.map((monitor) => {
        const monitorRecords = monitorMap.get(monitor.monitorId) || [];
        const desktopData = buildMemoryTrackData(monitorRecords, 90);
        const tabletData = buildMemoryTrackData(monitorRecords, 60);
        const mobileData = buildMemoryTrackData(monitorRecords, 30);
        const monitorTooltip = statusToTooltip[monitor.status];

        // ラベルを含める
        const monitorWithLabel = {
          ...monitor,
          label: latestHistory.label || monitor.monitorId,
        };

        return (
          <StatusCardProvider
            key={monitor.monitorId}
            value={{
              monitor: monitorWithLabel,
              data: {
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
