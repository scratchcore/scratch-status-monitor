/**
 * カスタムロガー
 * 統一されたログフォーマットを提供
 */

export type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const { timestamp, level, module, message, metadata } = entry;
  const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : "";
  return `[${timestamp}] [${level}] [${module}] ${message}${metadataStr}`;
}

export class Logger {
  constructor(private moduleName: string) {}

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      metadata,
    };
    const formattedLog = formatLog(entry);

    if (level === "ERROR") {
      console.error(formattedLog);
    } else if (level === "WARN") {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("INFO", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("WARN", message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log("ERROR", message, metadata);
  }
}

export function createLogger(moduleName: string): Logger {
  return new Logger(moduleName);
}
