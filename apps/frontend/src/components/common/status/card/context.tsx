import { createContext, ReactNode } from "react";
import { buildMemoryTrackData } from "../data";
import type { HistoryRecord } from "../rc";

export interface MonitorHistoryRecord extends HistoryRecord {
  label: string;
}

export interface MonitorData {
  monitor: MonitorHistoryRecord;
  data: {
    desktop: ReturnType<typeof buildMemoryTrackData>;
    tablet: ReturnType<typeof buildMemoryTrackData>;
    mobile: ReturnType<typeof buildMemoryTrackData>;
  };
}

export const StatusCardContext = createContext<MonitorData | null>(null);

export interface StatusCardProviderProps {
  children: ReactNode;
  value: MonitorData;
}
export const StatusCardProvider = ({
  children,
  value,
}: StatusCardProviderProps) => {
  return (
    <StatusCardContext.Provider value={value}>
      {children}
    </StatusCardContext.Provider>
  );
};
