import { ssmrc } from "@scratchcore/ssm-configs";
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
    bucketedAt: string; // ISO 8601形式（切り捨て）
  }>;
  lastUpdated: string;
}

const BACKUP_KEY = "backup:histories:snapshot"; // v2.0: バックアップ用キー

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
  getRecords(monitorId: string, limit?: number): Promise<HistoryRecord[]>;
  deleteRecords(monitorId: string): Promise<void>;
  cleanup(retentionDays: number): Promise<void>;
  restoreFromBackup(): Promise<void>; // v2.0: 起動時の復元
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

  async getRecords(monitorId: string, limit: number = 100): Promise<HistoryRecord[]> {
    const data = this.histories.get(monitorId);
    if (!data) return [];

    return data.records.slice(-limit).map((record) => {
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

  async restoreFromBackup(): Promise<void> {
    // InMemory版では何もしない
  }
}

/**
 * KV Store ベースの履歴サービス
 * v2.0: プロセスストレージ主体、KV はバックアップのみ
 * - メモリのみから高速取得（KV フォールバックなし）
 * - 定期的に KV へバックアップ（30分間隔）
 * - 起動時に KV から復元
 * - 定期クリーンアップで古いデータを削除（7日以前）
 */
class KVHistoryService implements HistoryService {
  private memoryCache: Map<string, StoredHistoryData> = new Map();
  private lastBackupTime: number = 0;
  private isRestored: boolean = false;

  constructor(private kv: any) {}

  private getKey(monitorId: string): string {
    return `history:${monitorId}`;
  }

  async saveRecord(monitorId: string, result: StatusCheckResultType): Promise<void> {
    // メモリキャッシュから既存データを取得（なければ新規作成）
    let existing = this.memoryCache.get(monitorId);
    if (!existing) {
      existing = {
        records: [],
        lastUpdated: new Date().toISOString(),
      };
      this.memoryCache.set(monitorId, existing);
    }

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

    // v2.0: KV バックアップ判定
    const now = Date.now();
    if (now - this.lastBackupTime > ssmrc.cache.kvBackupIntervalMs) {
      this.lastBackupTime = now;
      // 非同期でバックアップ
      this.backupToKV().catch((err: Error) => {
        console.error("Failed to backup histories to KV:", err);
      });
    }
  }

  /**
   * v2.0: KV へのバックアップ処理
   * 全モニターのデータを一括で保存
   */
  private async backupToKV(): Promise<void> {
    const allData: Record<string, StoredHistoryData> = {};
    
    for (const [monitorId, data] of this.memoryCache.entries()) {
      allData[monitorId] = data;
    }

    await this.kv.put(BACKUP_KEY, JSON.stringify(allData), {
      expirationTtl: ssmrc.cache.dataRetentionDays * 24 * 60 * 60, // 7日
    });

    console.log(`[HistoryService] Backup completed: ${Object.keys(allData).length} monitors`);
  }

  /**
   * v2.0: 起動時に KV から復元
   */
  async restoreFromBackup(): Promise<void> {
    if (this.isRestored) {
      return; // 既に復元済み
    }

    try {
      const backup = await this.kv.get(BACKUP_KEY, "json");
      if (backup) {
        let restoredMonitors = 0;
        for (const [monitorId, data] of Object.entries(backup as Record<string, StoredHistoryData>)) {
          this.memoryCache.set(monitorId, data);
          restoredMonitors++;
        }
        console.log(`[HistoryService] Restored from backup: ${restoredMonitors} monitors`);
      } else {
        console.log("[HistoryService] No backup found in KV");
      }
    } catch (err) {
      console.error("[HistoryService] Failed to restore from backup:", err);
    } finally {
      this.isRestored = true;
    }
  }

  async getRecords(monitorId: string, limit: number = 100): Promise<HistoryRecord[]> {
    // v2.0: メモリのみから取得（KV アクセスなし）
    const data = this.memoryCache.get(monitorId);
    if (!data) return [];

    return data.records.slice(-limit).map((record) => {
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

  async deleteRecords(monitorId: string): Promise<void> {
    this.memoryCache.delete(monitorId);
    // バックアップは次回の一括バックアップ時に更新される
  }

  async cleanup(retentionDays: number): Promise<void> {
    // v2.0: メモリ内のデータを7日以前で削除
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTime = cutoffDate.getTime();

    let cleanedMonitors = 0;
    let cleanedRecords = 0;

    for (const [monitorId, data] of this.memoryCache.entries()) {
      const initialLength = data.records.length;
      data.records = data.records.filter(
        (record) => new Date(record.recordedAt).getTime() > cutoffTime,
      );

      const removedCount = initialLength - data.records.length;
      cleanedRecords += removedCount;

      if (data.records.length === 0) {
        this.memoryCache.delete(monitorId);
        cleanedMonitors++;
      }
    }

    console.log(`[HistoryService] Cleanup completed: ${cleanedRecords} records removed, ${cleanedMonitors} monitors cleared`);
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
