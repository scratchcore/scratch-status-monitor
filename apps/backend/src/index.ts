import { Hono } from "hono";
import mainMiddleware from "./middleware/main";
import { createOpenAPIRoutes } from "./openapi-routes";
import { showRoutes } from "hono/dev";
import { checkAllMonitors } from "./services/monitorService";

/**
 * Cloudflare Workers ScheduledEvent 型
 */
interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

const app = new Hono();
app.route("*", mainMiddleware);

// OpenAPI ルートを統合
const openAPIApp = await createOpenAPIRoutes();
app.route("", openAPIApp);

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
 */
app.post("/test/trigger-monitor-check", async (c) => {
  const query = c.req.query("row");
  const rowMode = query === "" || query === "true" ? true : false;
  try {
    console.log("Manual trigger: Starting monitor check...");
    const result = await checkAllMonitors();
    console.log(
      `Monitor check completed. Overall status: ${result.overallStatus}`,
    );
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
 * 5分ごとに全モニターをチェック
 */
async function handleCron(event: ScheduledEvent): Promise<void> {
  try {
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
