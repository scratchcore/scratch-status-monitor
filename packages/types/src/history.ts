import { z } from "zod";

/**
 * 履歴レコード（単一のチェック結果を時系列で記録）
 */
export const HistoryRecord = z.object({
  id: z.uuid(),
  monitorId: z.uuid(),
  status: z.enum(["up", "degraded", "down", "unknown"]),
  statusCode: z.number().int().optional(),
  responseTime: z.number().int().min(0),
  errorMessage: z.string().optional(),
  recordedAt: z.date(),
  // v2.0: バケット化された時刻（切り捨て）
  bucketedAt: z.date(),
});

export type HistoryRecord = z.infer<typeof HistoryRecord>;

/**
 * モニター毎の履歴集計
 */
export const MonitorHistory = z.object({
  monitorId: z.uuid(),
  label: z.string(),
  records: z.array(HistoryRecord),
});

export type MonitorHistory = z.infer<typeof MonitorHistory>;

/**
 * 履歴取得レスポンス
 */
export const HistoryResponse = z.object({
  monitorId: z.uuid(),
  label: z.string(),
  records: z.array(HistoryRecord),
  totalRecords: z.number().int().min(0),
  oldestRecord: z.date().optional(),
  newestRecord: z.date().optional(),
  hasMore: z.boolean(),
  stats: z.object({
    upCount: z.number().int().min(0),
    degradedCount: z.number().int().min(0),
    downCount: z.number().int().min(0),
    unknownCount: z.number().int().min(0),
    uptime: z.number().min(0).max(100),
    avgResponseTime: z.number().int().min(0),
    minResponseTime: z.number().int().min(0).optional(),
    maxResponseTime: z.number().int().min(0).optional(),
  }),
});

export type HistoryResponse = z.infer<typeof HistoryResponse>;

/**
 * 統計情報
 */
export const HistoryStats = z.object({
  monitorId: z.uuid(),
  upCount: z.number().int().min(0),
  degradedCount: z.number().int().min(0),
  downCount: z.number().int().min(0),
  unknownCount: z.number().int().min(0),
  totalRecords: z.number().int().min(0),
  uptime: z.number().min(0).max(100), // パーセンテージ
  avgResponseTime: z.number().int().min(0),
  minResponseTime: z.number().int().min(0).optional(),
  maxResponseTime: z.number().int().min(0).optional(),
});

export type HistoryStats = z.infer<typeof HistoryStats>;
