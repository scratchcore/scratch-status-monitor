import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { createBearerAuthMiddleware } from "./middleware/bearerAuth";
import { errorHandler } from "./middleware/errorHandler";
import mainMiddleware from "./middleware/main";
import { createOpenAPIRoutes } from "./openapi-routes";
import { createApiRouter } from "./routes/api";
import { initializeCacheService } from "./services/cacheService";
import { initializeHistoryService } from "./services/historyService";
import { checkAllMonitors } from "./services/monitorService";
import type { Env } from "./types/env";
import { generateOpenAPISchema } from "./utils/openapi";

/**
 * Cloudflare Workers ScheduledEvent 型
 */
interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

const app = new Hono<{ Bindings: Env }>();

// KV Store を初期化（本番環境）
// Cloudflare Workers では、c.env.SCRAC_SSM_KV で KV Store へアクセス可能
app.use("*", async (c, next) => {
  // 初回のみ KV Store を初期化
  if (c.env.SCRAC_SSM_KV) {
    initializeCacheService(c.env.SCRAC_SSM_KV);
    initializeHistoryService(c.env.SCRAC_SSM_KV);
  }
  await next();
});

app.use("*", errorHandler());
app.route("*", mainMiddleware);

// Bearer 認証を適用（環境に応じて適用範囲が変わります）
app.use("*", createBearerAuthMiddleware());

// API ルータを先に作成してメタデータを登録
// (OpenAPI スキーマ生成の前に実行される必要があります)
const apiRouter = createApiRouter();
app.route("", apiRouter);

// OpenAPI ルートを統合
const openAPIApp = await createOpenAPIRoutes();
app.route("", openAPIApp);

/**
 * OpenAPI スキーマを提供
 * エンドポイント登録後に生成されます
 */
app.get("/openapi.json", (c) => {
  return c.json(generateOpenAPISchema());
});

app.get("/", (c) => {
  return c.json({
    message: "Scratch Status Monitor API",
    version: "1.0.0",
    docs: "/docs",
    openapi: "/openapi.json",
  });
});

/**
 * ローカル開発用: 手動でscheduledトリガーをテストするエンドポイント
 * ENVIRONMENT=development の場合のみ有効
 */
app.post("/test/trigger-monitor-check", async (c) => {
  // 本番環境ではテストルートを無効化
  const env = c.env.ENVIRONMENT || "development";
  if (env !== "development") {
    return c.json(
      {
        success: false,
        message: "Test endpoints are only available in development environment",
      },
      { status: 404 },
    );
  }

  const query = c.req.query("row");
  const rowMode = !!(query === "" || query === "true");
  try {
    console.log("Manual trigger: Starting monitor check...");
    const result = await checkAllMonitors();
    console.log(`Monitor check completed. Overall status: ${result.overallStatus}`);
    return c.json({
      success: true,
      message: "Monitor check executed successfully",
      result: {
        overallStatus: result.overallStatus,
        categories: result.categories.length,
        monitors: result.monitors.length,
        timestamp: result.timestamp,
      },
      row: rowMode ? result : undefined,
    });
  } catch (error) {
    console.error("Error during manual trigger:", error);
    return c.json(
      {
        success: false,
        message: "Error during monitor check",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

showRoutes(app, {
  verbose: true,
});

/**
 * Cron Trigger ハンドラー
 * 全モニターをチェック
 */
async function handleCron(_event: ScheduledEvent, env: Env): Promise<void> {
  try {
    if (env.SCRAC_SSM_KV) {
      initializeCacheService(env.SCRAC_SSM_KV);
      initializeHistoryService(env.SCRAC_SSM_KV);
    }
    console.log("Starting scheduled monitor check...");
    const result = await checkAllMonitors();
    console.log(`Monitor check completed. Overall status: ${result.overallStatus}`);
  } catch (error) {
    console.error("Error during scheduled monitor check:", error);
    throw error;
  }
}

export default {
  fetch: app.fetch,
  scheduled: handleCron,
};
