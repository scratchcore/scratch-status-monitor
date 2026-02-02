import { v4 as uuidv4 } from "uuid";
import {
  HistoryRecord,
  HistoryStats,
  type StatusCheckResult as StatusCheckResultType,
} from "@scratchcore/ssm-types";

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
  }>;
  lastUpdated: string;
}

/**
 * 履歴サービスのインターフェース
 */
export interface HistoryService {
  saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void>;
  getRecords(monitorId: string, limit?: number): Promise<HistoryRecord[]>;
  deleteRecords(monitorId: string): Promise<void>;
  cleanup(retentionDays: number): Promise<void>;
}

/**
 * メモリベースの履歴サービス（開発用）
 */
class InMemoryHistoryService implements HistoryService {
  private histories: Map<string, StoredHistoryData> = new Map();

  async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
    const existing = this.histories.get(monitorId) || {
      records: [],
      lastUpdated: new Date().toISOString(),
    };

    existing.records.push({
      id: uuidv4(),
      monitorId,
      status: result.status,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
      recordedAt: result.checkedAt.toISOString(),
    });

    existing.lastUpdated = new Date().toISOString();
    this.histories.set(monitorId, existing);
  }

  async getRecords(monitorId: string, limit: number = 100): Promise<HistoryRecord[]> {
    const data = this.histories.get(monitorId);
    if (!data) return [];

    return data.records.slice(-limit).map((record) =>
      HistoryRecord.parse({
        ...record,
        recordedAt: new Date(record.recordedAt),
      }),
    );
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
        (record) => new Date(record.recordedAt).getTime() > cutoffTime,
      );

      if (data.records.length === 0) {
        this.histories.delete(monitorId);
      }
    }
  }
}

/**
 * KV Store ベースの履歴サービス
 */
class KVHistoryService implements HistoryService {
  constructor(private kv: any) {}

  private getKey(monitorId: string): string {
    return `history:${monitorId}`;
  }

  async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
    const key = this.getKey(monitorId);
    const existing: StoredHistoryData = (await this.kv.get(key, "json")) || {
      records: [],
      lastUpdated: new Date().toISOString(),
    };

    existing.records.push({
      id: uuidv4(),
      monitorId,
      status: result.status,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
      recordedAt: result.checkedAt.toISOString(),
    });

    existing.lastUpdated = new Date().toISOString();

    await this.kv.put(key, JSON.stringify(existing), {
      expirationTtl: 30 * 24 * 60 * 60, // 30日後に自動削除
    });
  }

  async getRecords(monitorId: string, limit: number = 100): Promise<HistoryRecord[]> {
    const key = this.getKey(monitorId);
    const data: StoredHistoryData | null = await this.kv.get(key, "json");

    if (!data) return [];

    return data.records.slice(-limit).map((record) =>
      HistoryRecord.parse({
        ...record,
        recordedAt: new Date(record.recordedAt),
      }),
    );
  }

  async deleteRecords(monitorId: string): Promise<void> {
    const key = this.getKey(monitorId);
    await this.kv.delete(key);
  }

  async cleanup(retentionDays: number): Promise<void> {
    // KV Store の expirationTtl で自動削除されるため、ここでは何もしない
    console.log(`History cleanup scheduled for ${retentionDays} days retention`);
  }
}

/**
 * 履歴統計を計算
 */
export function calculateHistoryStats(monitorId: string, records: HistoryRecord[]): HistoryStats {
  const upCount = records.filter((r) => r.status === "up").length;
  const degradedCount = records.filter((r) => r.status === "degraded").length;
  const downCount = records.filter((r) => r.status === "down").length;
  const totalRecords = records.length;

  const uptime = totalRecords > 0 ? (upCount / totalRecords) * 100 : 0;
  const avgResponseTime =
    totalRecords > 0
      ? Math.round(records.reduce((sum, r) => sum + r.responseTime, 0) / totalRecords)
      : 0;

  return HistoryStats.parse({
    monitorId,
    upCount,
    degradedCount,
    downCount,
    totalRecords,
    uptime,
    avgResponseTime,
  });
}

/**
 * 履歴サービスのシングルトンインスタンス
 */
let historyServiceInstance: HistoryService | null = null;

/**
 * 履歴サービスを初期化または取得
 */
export function initializeHistoryService(kv?: any): HistoryService {
  if (historyServiceInstance) {
    return historyServiceInstance;
  }

  if (kv) {
    historyServiceInstance = new KVHistoryService(kv);
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
