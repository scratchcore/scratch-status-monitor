import { createContext, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  colorMapping,
  colorSlugMapping,
  statusToTooltip,
  type HistoryResponse,
  type StatusLevel,
} from "../rc";
import { useHistoryPagination } from "@/lib/hooks/useHistoryPagination";

export interface StatusPageContextType {
  histories: HistoryResponse[];
  nextRefreshAt?: number;
  refreshIntervalMs?: number;

  formattedRemaining: string | null;
  refreshHint: string | null;
  overallStatus: StatusLevel;
  overallTooltip: keyof typeof colorMapping;
  colorSlug: string;
}
export const StatusPageContext = createContext<StatusPageContextType | null>(
  null,
);

export interface StatusPageProviderProps {
  children?: ReactNode;
  histories: HistoryResponse[];
  nextRefreshAt?: number;
  refreshIntervalMs?: number;
}
export function StatusPageProvider({
  children,
  ...props
}: StatusPageProviderProps) {
  const { nextRefreshAt, refreshIntervalMs, histories: initialHistories } = props;
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!nextRefreshAt) {
      return null;
    }
    return Math.max(0, nextRefreshAt - Date.now());
  });

  // useHistoryPagination で自動的にすべてのデータを読み込む（autoLoadAll = true）
  const { histories } = useHistoryPagination(initialHistories, true);

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

  // 履歴から全体的なステータスを計算
  const overallStatus: StatusLevel = useMemo(() => {
    if (!histories || histories.length === 0) {
      return "unknown";
    }
    
    // すべてのモニターの最新レコードを取得
    const allLatestStatuses = histories
      .flatMap((history) => {
        if (!history.records || history.records.length === 0) return [];
        // 各モニターの最新レコード（配列の最後）を取得
        const latestRecord = history.records[history.records.length - 1];
        return latestRecord.status;
      });
    
    if (allLatestStatuses.length === 0) {
      return "unknown";
    }
    
    // すべてのモニターのステータスから全体ステータスを計算
    if (allLatestStatuses.includes("down")) return "down";
    if (allLatestStatuses.includes("degraded")) return "degraded";
    if (allLatestStatuses.every((s) => s === "up")) return "up";
    return "unknown";
  }, [histories]);

  const overallTooltip = statusToTooltip[overallStatus];
  const colorSlug = colorSlugMapping[overallTooltip];

  return (
    <StatusPageContext.Provider
      value={{
        histories,
        nextRefreshAt,
        refreshIntervalMs,
        formattedRemaining,
        refreshHint,
        overallStatus,
        overallTooltip,
        colorSlug,
      }}
    >
      {children}
    </StatusPageContext.Provider>
  );
}
