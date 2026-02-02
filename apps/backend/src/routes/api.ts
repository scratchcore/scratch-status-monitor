import { Hono } from "hono";
import { z } from "zod";
import {
  getAllMonitorsHistoryHandler,
  getMonitorHistoryHandler,
  getMonitorStatsHandler,
} from "../procedures/history";
import { getStatusHandler, refreshStatusHandler } from "../procedures/status";
import { HistoryResponse, HistoryStats, StatusResponse } from "@scratchcore/ssm-types";
import { type APIEndpointMetadata, registerEndpoint } from "../types/api-metadata";
import { UUIDSchema } from "../utils/validators";

/**
 * /api ルータ
 * ステータス・履歴・統計情報に関するエンドポイントを提供
 */
export const createApiRouter = () => {
  const router = new Hono();

  // メタデータ登録ヘルパー関数
  const _registerAndHandle = (metadata: APIEndpointMetadata, handler: (c: any) => Promise<any>) => {
    registerEndpoint(metadata);
    return handler;
  };

  /**
   * ステータスエンドポイント
   */
  // GET /api/status - 現在のステータスを取得
  registerEndpoint({
    method: "get",
    path: "/status",
    tags: ["Status"],
    summary: "現在のステータスを取得",
    description: "全モニターの最新ステータスを取得します（キャッシュ対応）",
    operationId: "getStatus",
    responses: {
      "200": {
        schema: StatusResponse,
        description: "ステータス取得成功",
      },
      "500": {
        description: "サーバーエラー",
      },
    },
  });

  router.get("/status", async (c) => {
    const status = await getStatusHandler();
    return c.json({
      success: true,
      data: status,
    });
  });

  // POST /api/status/refresh - ステータスを強制更新
  registerEndpoint({
    method: "post",
    path: "/status/refresh",
    tags: ["Status"],
    summary: "ステータスを強制更新",
    description: "全モニターを再チェックして最新ステータスを取得",
    operationId: "refreshStatus",
    responses: {
      "200": {
        schema: StatusResponse,
        description: "ステータス更新成功",
      },
      "500": {
        description: "サーバーエラー",
      },
    },
  });

  router.post("/status/refresh", async (c) => {
    const status = await refreshStatusHandler();
    return c.json({
      success: true,
      data: status,
      message: "Status refreshed successfully",
    });
  });

  /**
   * 履歴エンドポイント
   */
  // GET /api/history - 全モニターの履歴を取得
  registerEndpoint({
    method: "get",
    path: "/history",
    tags: ["History"],
    summary: "全モニターの履歴を取得",
    description: "全てのモニターの履歴を取得します",
    operationId: "getAllHistory",
    parameters: {
      query: {
        limit: z.number().int().min(1).max(1000).default(100),
      },
    },
    responses: {
      "200": {
        schema: z.object({
          monitors: z.array(HistoryResponse),
        }),
        description: "履歴取得成功",
      },
      "400": {
        description: "無効なリクエスト",
      },
      "500": {
        description: "サーバーエラー",
      },
    },
  });

  router.get("/history", async (c) => {
    const limitParam = c.req.query("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const histories = await getAllMonitorsHistoryHandler({ limit });
    return c.json({
      success: true,
      data: histories,
    });
  });

  // GET /api/history/:monitorId - 特定のモニターの履歴を取得
  registerEndpoint({
    method: "get",
    path: "/history/:monitorId",
    tags: ["History"],
    summary: "特定のモニターの履歴を取得",
    description: "指定されたモニターの詳細な履歴を取得します",
    operationId: "getMonitorHistory",
    parameters: {
      path: {
        monitorId: UUIDSchema,
      },
      query: {
        limit: z.number().int().min(1).max(1000).default(100),
      },
    },
    responses: {
      "200": {
        schema: HistoryResponse,
        description: "履歴取得成功",
      },
      "400": {
        description: "無効なリクエスト",
      },
      "404": {
        description: "モニターが見つかりません",
      },
      "500": {
        description: "サーバーエラー",
      },
    },
  });

  router.get("/history/:monitorId", async (c) => {
    const monitorId = c.req.param("monitorId");
    const limitParam = c.req.query("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const history = await getMonitorHistoryHandler({
      monitorId,
      limit,
    });

    return c.json({
      success: true,
      data: history,
    });
  });

  /**
   * 統計情報エンドポイント
   */
  // GET /api/stats/:monitorId - モニターの統計情報を取得
  registerEndpoint({
    method: "get",
    path: "/stats/:monitorId",
    tags: ["Monitors"],
    summary: "モニターの統計情報を取得",
    description: "指定されたモニターの稼働率と平均応答時間を取得します",
    operationId: "getMonitorStats",
    parameters: {
      path: {
        monitorId: UUIDSchema,
      },
      query: {
        limit: z.number().int().min(1).max(1000).default(100),
      },
    },
    responses: {
      "200": {
        schema: HistoryStats,
        description: "統計情報取得成功",
      },
      "400": {
        description: "無効なリクエスト",
      },
      "404": {
        description: "モニターが見つかりません",
      },
      "500": {
        description: "サーバーエラー",
      },
    },
  });

  router.get("/stats/:monitorId", async (c) => {
    const monitorId = c.req.param("monitorId");
    const limitParam = c.req.query("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const stats = await getMonitorStatsHandler({
      monitorId,
      limit,
    });

    return c.json({
      success: true,
      data: stats,
    });
  });

  return router;
};
