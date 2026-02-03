import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { createBearerAuthMiddleware } from "./middleware/bearerAuth";
import { errorHandler } from "./middleware/errorHandler";
import mainMiddleware from "./middleware/main";
import { createOpenAPIRoutes } from "./openapi-routes";
import { createApiRouter } from "./routes/api";
import debugRouter from "./routes/debug";
import { initializeCacheService, getCacheService } from "./services/cacheService";
import { initializeHistoryService, getHistoryService } from "./services/historyService";
import { startPeriodicCleanup } from "./services/cleanupService";
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

/**
 * v2.0: データ復元フラグ
 * 起動時に一度だけ KV から復元する
 */
let isDataRestored = false;

const app = new Hono<{ Bindings: Env }>();

/**
 * v2.0: 起動時の復元処理
 * KV バックアップからデータを復元し、クリーンアップを開始
 */
async function restoreFromKVIfNeeded(kv: any): Promise<void> {
  if (isDataRestored) {
    return; // 既に復元済み
  }

  console.log("[App] Restoring data from KV backup...");
  
  try {
    // Cache と History を復元
    const cacheService = getCacheService();
    const historyService = getHistoryService();
    
    await Promise.all([
      cacheService.restoreFromBackup(),
      historyService.restoreFromBackup(),
    ]);
    
    // クリーンアップを開始
    startPeriodicCleanup();
    
    isDataRestored = true;
    console.log("[App] Data restoration completed");
  } catch (err) {
    console.error("[App] Failed to restore data from KV:", err);
    isDataRestored = true; // エラーでも次回はスキップ
  }
}

// KV Store を初期化（本番環境）
// v2.0: 初期化後、起動時に KV から復元
app.use("*", async (c, next) => {
  // 初回のみ KV Store を初期化
  if (c.env.SCRAC_SSM_KV) {
    initializeCacheService(c.env.SCRAC_SSM_KV);
    initializeHistoryService(c.env.SCRAC_SSM_KV);
    
    // v2.0: KV から復元（1回のみ）
    await restoreFromKVIfNeeded(c.env.SCRAC_SSM_KV);
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
 * v2.0: 全モニターをチェックし、KV から復元が必要な場合は実行
 */
async function handleCron(_event: ScheduledEvent, env: Env): Promise<void> {
  try {
    if (env.SCRAC_SSM_KV) {
      initializeCacheService(env.SCRAC_SSM_KV);
      initializeHistoryService(env.SCRAC_SSM_KV);
      
      // v2.0: 起動時に KV から復元
      await restoreFromKVIfNeeded(env.SCRAC_SSM_KV);
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
