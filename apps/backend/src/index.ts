import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { createBearerAuthMiddleware } from "./middleware/bearerAuth";
import { errorHandler } from "./middleware/errorHandler";
import mainMiddleware from "./middleware/main";
import { createOpenAPIRoutes } from "./openapi-routes";
import { createApiRouter } from "./routes/api";
import debugRouter from "./routes/debug";
import { initializeCacheService } from "./services/cacheService";
import { initializeHistoryService } from "./services/historyService";
import { startPeriodicCleanup } from "./services/cleanupService";
import { checkAllMonitors } from "./services/monitorService";
import type { Env } from "./types/env";
import { generateOpenAPISchema } from "./utils/openapi";
import { initializeSupabaseClient } from "./services/supabaseClient";

/**
 * Cloudflare Workers ScheduledEvent 型
 */
interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

const app = new Hono<{ Bindings: Env }>();

// Supabase クライアントを初期化
app.use("*", async (c, next) => {
  const supabase = initializeSupabaseClient(c.env);
  initializeCacheService(supabase);
  initializeHistoryService(supabase);
  startPeriodicCleanup();
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

// v2.0: デバッグ・監視用ルート
app.route("/debug", debugRouter);

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

showRoutes(app, {
  verbose: true,
});

/**
 * Cron Trigger ハンドラー
 * v2.0: 全モニターをチェックし、Supabase に保存
 */
async function handleCron(_event: ScheduledEvent, env: Env): Promise<void> {
  try {
    const supabase = initializeSupabaseClient(env);
    initializeCacheService(supabase);
    initializeHistoryService(supabase);
    startPeriodicCleanup();
    console.log("Starting scheduled monitor check...");
    const result = await checkAllMonitors();
    console.log(
      `Monitor check completed. Overall status: ${result.overallStatus}`,
    );
  } catch (error) {
    console.error("Error during scheduled monitor check:", error);
    throw error;
  }
}

export default {
  fetch: app.fetch,
  scheduled: handleCron,
};
