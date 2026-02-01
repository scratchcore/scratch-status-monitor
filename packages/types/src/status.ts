import { z } from "zod";

/**
 * ステータスレベルの定義
 * - up: サービスが正常に稼働している
 * - degraded: サービスが部分的に稼働している
 * - down: サービスが停止している
 * - unknown: ステータスが未確認
 */
export const StatusLevel = z.enum(["up", "degraded", "down", "unknown"]);
export type StatusLevel = z.infer<typeof StatusLevel>;

/**
 * 単一モニターのステータス情報
 */
export const MonitorStatus = z.object({
  id: z.uuid(),
  label: z.string(),
  category: z.string(),
  url: z.url(),
  status: StatusLevel,
  statusCode: z.number().int().optional(),
  responseTime: z.number().int().min(0).optional(),
  errorMessage: z.string().optional(),
  lastCheckedAt: z.date(),
});

export type MonitorStatus = z.infer<typeof MonitorStatus>;

/**
 * カテゴリー別のステータス集計
 */
export const CategoryStatus = z.object({
  id: z.string(),
  label: z.string(),
  status: StatusLevel,
  itemCount: z.number().int().min(0),
  upCount: z.number().int().min(0),
  degradedCount: z.number().int().min(0),
  downCount: z.number().int().min(0),
});

export type CategoryStatus = z.infer<typeof CategoryStatus>;

/**
 * 全体ステータスレスポンス
 */
export const StatusResponse = z.object({
  overallStatus: StatusLevel,
  categories: z.array(CategoryStatus),
  monitors: z.array(MonitorStatus),
  timestamp: z.date(),
  expiresAt: z.date(),
});

export type StatusResponse = z.infer<typeof StatusResponse>;

/**
 * ステータスチェック結果
 */
export const StatusCheckResult = z.object({
  id: z.uuid(),
  status: StatusLevel,
  statusCode: z.number().int().optional(),
  responseTime: z.number().int().min(0),
  errorMessage: z.string().optional(),
  checkedAt: z.date(),
});

export type StatusCheckResult = z.infer<typeof StatusCheckResult>;

