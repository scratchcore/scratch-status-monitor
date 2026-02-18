import { ssmrc } from "@scratchcore/ssm-configs";
import {
  HistoryRecord,
  HistoryStats,
  type StatusCheckResult as StatusCheckResultType,
} from "@scratchcore/ssm-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "./logger";

const logger = createLogger("HistoryService");

/**
 * KV Store に保存する履歴データの構造
 */
interface StoredHistoryData {
  records: Array<{
    id: string;
    monitorId: string;
    status: string;
    statusCode?: number;
    responseTime: number;
    errorMessage?: string;
    recordedAt: string; // ISO 8601形式
    bucketedAt: string; // ISO 8601形式（切り捨て）
  }>;
  lastUpdated: string;
}

const HISTORY_TABLE = "history_records";

/**
 * v2.0: 時刻を指定間隔で切り捨て
 */
function floorToInterval(date: Date, intervalMs: number): Date {
  const time = date.getTime();
  const floored = Math.floor(time / intervalMs) * intervalMs;
  return new Date(floored);
}

/**
 * 履歴サービスのインターフェース
 * v2.0: プロセスストレージ主体、KV はバックアップのみ
 */
export interface HistoryService {
  saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void>;
  getRecords(monitorId: string, limit?: number, offset?: number): Promise<HistoryRecord[]>;
  getTotalCount(monitorId: string): Promise<number>;
  deleteRecords(monitorId: string): Promise<void>;
  cleanup(retentionDays: number): Promise<void>;
  restoreFromBackup(): Promise<void>; // Supabase では no-op
}

/**
 * メモリベースの履歴サービス（開発用）
 * v2.0: メモリのみで管理、KV バックアップなし
 */
class InMemoryHistoryService implements HistoryService {
  private histories: Map<string, StoredHistoryData> = new Map();

  async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
    const existing = this.histories.get(monitorId) || {
      records: [],
      lastUpdated: new Date().toISOString(),
    };

    const recordedAt = result.checkedAt;
    const bucketedAt = floorToInterval(recordedAt, ssmrc.cache.bucketIntervalMs);

    existing.records.push({
      id: uuidv4(),
      monitorId,
      status: result.status,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
      recordedAt: recordedAt.toISOString(),
      bucketedAt: bucketedAt.toISOString(),
    });

    existing.lastUpdated = new Date().toISOString();
    this.histories.set(monitorId, existing);
  }

  async getRecords(
    monitorId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<HistoryRecord[]> {
    const data = this.histories.get(monitorId);
    if (!data) return [];

    const total = data.records.length;
    const safeOffset = Math.max(0, offset);
    const end = Math.max(0, total - safeOffset);
    const start = Math.max(0, end - limit);

    return data.records.slice(start, end).map((record) => {
      const recordedAt = new Date(record.recordedAt);
      const bucketedAt = record.bucketedAt
        ? new Date(record.bucketedAt)
        : floorToInterval(recordedAt, ssmrc.cache.bucketIntervalMs);

      return HistoryRecord.parse({
        ...record,
        recordedAt,
        bucketedAt,
      });
    });
  }

  async getTotalCount(monitorId: string): Promise<number> {
    const data = this.histories.get(monitorId);
    return data ? data.records.length : 0;
  }

  async deleteRecords(monitorId: string): Promise<void> {
    this.histories.delete(monitorId);
  }

  async cleanup(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTime = cutoffDate.getTime();

    for (const [monitorId, data] of this.histories.entries()) {
      data.records = data.records.filter(
        (record) => new Date(record.recordedAt).getTime() > cutoffTime
      );

      if (data.records.length === 0) {
        this.histories.delete(monitorId);
      }
    }
  }

  async restoreFromBackup(): Promise<void> {
    // InMemory版では何もしない
  }
}

/**
 * Supabase ベースの履歴サービス
 */
class SupabaseHistoryService implements HistoryService {
  constructor(private client: SupabaseClient) {}

  async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
    const recordedAt = result.checkedAt;
    const bucketedAt = floorToInterval(recordedAt, ssmrc.cache.bucketIntervalMs);

    const { error } = await this.client.from(HISTORY_TABLE).upsert(
      {
        id: uuidv4(),
        monitor_id: monitorId,
        status: result.status,
        status_code: result.statusCode ?? null,
        response_time: result.responseTime,
        error_message: result.errorMessage ?? null,
        recorded_at: recordedAt.toISOString(),
        bucketed_at: bucketedAt.toISOString(),
      },
      { onConflict: "monitor_id,recorded_at" }
    );

    if (error) {
      logger.error("Failed to insert history record", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getRecords(
    monitorId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<HistoryRecord[]> {
    const { data, error } = await this.client
      .from(HISTORY_TABLE)
      .select(
        "id, monitor_id, status, status_code, response_time, error_message, recorded_at, bucketed_at"
      )
      .eq("monitor_id", monitorId)
      .order("recorded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Failed to fetch records", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }

    const ordered = (data ?? []).reverse();
    return ordered.map((record) =>
      HistoryRecord.parse({
        id: record.id,
        monitorId: record.monitor_id,
        status: record.status,
        statusCode: record.status_code ?? undefined,
        responseTime: record.response_time,
        errorMessage: record.error_message ?? undefined,
        recordedAt: new Date(record.recorded_at),
        bucketedAt: new Date(record.bucketed_at),
      })
    );
  }

  async getTotalCount(monitorId: string): Promise<number> {
    const { count, error } = await this.client
      .from(HISTORY_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("monitor_id", monitorId);

    if (error) {
      logger.error("Failed to fetch count", {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }

    return count ?? 0;
  }

  async deleteRecords(monitorId: string): Promise<void> {
    const { error } = await this.client.from(HISTORY_TABLE).delete().eq("monitor_id", monitorId);
    if (error) {
      logger.error("Failed to delete records", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async cleanup(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { error, count } = await this.client
      .from(HISTORY_TABLE)
      .delete({ count: "exact" })
      .lt("recorded_at", cutoffDate.toISOString());

    if (error) {
      logger.error("Cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    logger.info("Cleanup completed", { recordsRemoved: count ?? 0 });
  }

  async restoreFromBackup(): Promise<void> {
    // Supabase では復元不要
  }
}

/**
 * 履歴統計を計算
 */
export function calculateHistoryStats(monitorId: string, records: HistoryRecord[]): HistoryStats {
  const upCount = records.filter((r) => r.status === "up").length;
  const degradedCount = records.filter((r) => r.status === "degraded").length;
  const downCount = records.filter((r) => r.status === "down").length;
  const unknownCount = records.filter((r) => r.status === "unknown").length;
  const totalRecords = records.length;

  const uptime = totalRecords > 0 ? (upCount / totalRecords) * 100 : 0;

  const responseTimes = records.map((r) => r.responseTime);
  const avgResponseTime =
    totalRecords > 0
      ? Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / totalRecords)
      : 0;
  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : undefined;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : undefined;

  return HistoryStats.parse({
    monitorId,
    upCount,
    degradedCount,
    downCount,
    unknownCount,
    totalRecords,
    uptime,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
  });
}

/**
 * 履歴サービスのシングルトンインスタンス
 */
let historyServiceInstance: HistoryService | null = null;

/**
 * 履歴サービスを初期化または取得
 */
export function initializeHistoryService(client?: SupabaseClient): HistoryService {
  if (historyServiceInstance) {
    return historyServiceInstance;
  }

  if (client) {
    historyServiceInstance = new SupabaseHistoryService(client);
  } else {
    historyServiceInstance = new InMemoryHistoryService();
  }

  return historyServiceInstance;
}

/**
 * 履歴サービスインスタンスを取得
 */
export function getHistoryService(): HistoryService {
  if (!historyServiceInstance) {
    historyServiceInstance = new InMemoryHistoryService();
  }
  return historyServiceInstance;
}
