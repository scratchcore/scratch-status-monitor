import { createContext, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  colorMapping,
  colorSlugMapping,
  statusToTooltip,
  type HistoryResponse,
  type StatusLevel,
} from "../rc";

/**
 * 時間カウントダウン専用Context
 * 他のコンポーネントを巻き込まない（1秒ごと更新）
 */
export interface StatusPageCountdownContextType {
  formattedRemaining: string | null;
}

export const StatusPageCountdownContext =
  createContext<StatusPageCountdownContextType | null>(null);

/**
 * ステータス・履歴データ専用Context
 * データ変更時にだけ更新（滅多に変わらない）
 */
export interface StatusPageDataContextType {
  histories: HistoryResponse[];
  refreshIntervalMs?: number;
  refreshHint: string | null;
  overallStatus: StatusLevel;
  overallTooltip: keyof typeof colorMapping;
  colorSlug: string;
}

export const StatusPageDataContext =
  createContext<StatusPageDataContextType | null>(null);

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
  const { nextRefreshAt, refreshIntervalMs, histories } = props;

  // ============================================
  // COUNTDOWN CONTEXT: 時間カウントダウン専用
  // （1秒ごと更新、他のコンテンツには影響なし）
  // ============================================
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

  const countdownContextValue = useMemo(
    () => ({
      formattedRemaining,
    }),
    [formattedRemaining],
  );

  // ============================================
  // DATA CONTEXT: 履歴・ステータス専用
  // （データ更新時にだけ更新、計算量多い）
  // ============================================
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

  const dataContextValue = useMemo(
    () => ({
      histories,
      refreshIntervalMs,
      refreshHint,
      overallStatus,
      overallTooltip,
      colorSlug,
    }),
    [histories, refreshIntervalMs, refreshHint, overallStatus, overallTooltip, colorSlug],
  );

  return (
    <StatusPageDataContext.Provider value={dataContextValue}>
      <StatusPageCountdownContext.Provider value={countdownContextValue}>
        {children}
      </StatusPageCountdownContext.Provider>
    </StatusPageDataContext.Provider>
  );
}
