import { z } from "zod";
import { HistoryResponse, HistoryStats } from "./schemas/history";
import { StatusResponse } from "./schemas/status";

/**
 * oRPC API 定義
 * 全ハンドラーをここで定義して、型安全なAPI契約を実現
 */

/**
 * ステータス取得クエリ
 */
export const statusQueries = {
  getStatus: {
    input: z.void(),
    output: StatusResponse,
  },
};

/**
 * ステータス更新ミューテーション
 */
export const statusMutations = {
  refreshStatus: {
    input: z.void(),
    output: StatusResponse,
  },
};

/**
 * 履歴取得クエリ
 */
export const historyQueries = {
  getMonitorHistory: {
    input: z.object({
      monitorId: z.uuid("モニターIDは有効なUUIDである必要があります"),
      limit: z.number().int().min(1).max(1000).default(100),
    }),
    output: HistoryResponse,
  },

  getAllMonitorsHistory: {
    input: z.object({
      limit: z.number().int().min(1).max(1000).default(100),
    }),
    output: z.array(HistoryResponse),
  },

  getMonitorStats: {
    input: z.object({
      monitorId: z.uuid("モニターIDは有効なUUIDである必要があります"),
      limit: z.number().int().min(1).max(1000).default(100),
    }),
    output: HistoryStats,
  },
};

/**
 * モニター取得クエリ
 */
export const monitorQueries = {
  getMonitors: {
    input: z.void(),
    output: z.array(
      z.object({
        id: z.uuid(),
        label: z.string(),
        category: z.string(),
        url: z.url(),
      }),
    ),
  },

  getMonitor: {
    input: z.object({
      monitorId: z.uuid("モニターIDは有効なUUIDである必要があります"),
    }),
    output: z
      .object({
        id: z.uuid(),
        label: z.string(),
        category: z.string(),
        url: z.url(),
      })
      .optional(),
  },
};

/**
 * 全API定義
 */
export const apiDefinition = {
  queries: {
    ...statusQueries,
    ...historyQueries,
    ...monitorQueries,
  },
  mutations: {
    ...statusMutations,
  },
} as const;
