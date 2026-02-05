import { memo, useContext, useMemo } from "react";
import { StatusPageDataContext } from "./context-optimized";
import { buildMemoryTrackData } from "../data";
import { statusToTooltip } from "../rc";
import { StatusCardProvider } from "../card/context";
import { StatusCard } from "../card";

/**
 * MonitorCard: 個別モニターカードをメモ化
 * 親の再レンダリングに影響されない
 */
const MonitorCard = memo(function MonitorCard({
  history,
}: {
  history: any;
}) {
  // memo化されているため、history の参照が変わらない限り再レンダリングなし
  const monitorRecords = history.records as any[];

  // データフォーマッターを一度だけ実行
  const trackData = useMemo(() => {
    return {
      desktop: buildMemoryTrackData(monitorRecords, 90),
      tablet: buildMemoryTrackData(monitorRecords, 60),
      mobile: buildMemoryTrackData(monitorRecords, 30),
    };
  }, [monitorRecords]);

  const latestRecord = monitorRecords[monitorRecords.length - 1];
  if (!latestRecord) return null;

  const monitorTooltip = statusToTooltip[latestRecord.status as keyof typeof statusToTooltip];
  const monitorWithLabel = {
    ...latestRecord,
    label: history.label,
  };

  return (
    <StatusCardProvider
      value={{
        monitor: monitorWithLabel,
        uptimePercent: history.stats.uptime,
        data: {
          row: monitorRecords,
          desktop: trackData.desktop,
          tablet: trackData.tablet,
          mobile: trackData.mobile,
        },
      }}
    >
      <StatusCard monitorTooltip={monitorTooltip} />
    </StatusCardProvider>
  );
});

export function Monitors() {
  const s = useContext(StatusPageDataContext);
  if (!s) return null;
  const { histories } = s;

  if (!histories || histories.length === 0) {
    return null;
  }

  // 履歴に変更がなければ、このメモリは再計算されない
  const monitorCards = useMemo(() => {
    return histories.map((history) => (
      <MonitorCard key={history.monitorId} history={history} />
    ));
  }, [histories]);

  return (
    <div className="relative w-full rounded-lg border p-6 text-left shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-900 mt-10 space-y-6">
      {monitorCards}
    </div>
  );
}
