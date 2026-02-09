import { createContext, type ReactNode, useContext } from "react";
import type { buildMemoryTrackData } from "@/lib/status-page/data";
import type { HistoryRecord } from "@/lib/status-page/rc";

export interface MonitorHistoryRecord extends HistoryRecord {
  label: string;
}

export interface MonitorData {
  monitor: Partial<MonitorHistoryRecord>;
  uptimePercent?: number;
  data?: {
    row: HistoryRecord[];
    desktop: ReturnType<typeof buildMemoryTrackData>;
    tablet: ReturnType<typeof buildMemoryTrackData>;
    mobile: ReturnType<typeof buildMemoryTrackData>;
  };
}

export type TimePeriod = "today" | "yesterday" | "lastTwoDays" | "all";

export const StatusCardContext = createContext<MonitorData | null>(null);

export const useStatusCardContext = () => {
  const context = useContext(StatusCardContext);
  if (!context) {
    throw new Error("useStatusCardContext must be used within a StatusCardProvider");
  }
  return context;
};

export interface StatusCardProviderProps {
  children: ReactNode;
  value: MonitorData;
}

export const StatusCardProvider = ({ children, value }: StatusCardProviderProps) => {
  return <StatusCardContext.Provider value={value}>{children}</StatusCardContext.Provider>;
};
