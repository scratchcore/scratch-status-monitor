import {
  StatusCheckResult,
  StatusLevel,
  type StatusLevel as StatusLevelType,
} from "../schemas/status";

interface CheckOptions {
  timeout?: number;
}

/**
 * ステータスコードから状態を判定
 */
function determineStatusFromCode(statusCode: number): StatusLevelType {
  if (statusCode >= 200 && statusCode < 300) {
    return "up";
  }
  if (statusCode >= 300 && statusCode < 400) {
    return "up";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "degraded";
  }
  if (statusCode >= 500) {
    return "down";
  }
  return "down";
}

/**
 * 単一のエンドポイントをチェック
 */
export async function checkMonitorStatus(
  id: string,
  url: string,
  options: CheckOptions = {}
): Promise<StatusCheckResult> {
  const timeout = options.timeout || 10000; // デフォルト10秒
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const status = determineStatusFromCode(response.status);

    return StatusCheckResult.parse({
      id,
      status,
      statusCode: response.status,
      responseTime,
      checkedAt: new Date(),
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // タイムアウトの場合
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return StatusCheckResult.parse({
        id,
        status: "down" as const,
        responseTime,
        errorMessage: `Timeout after ${timeout}ms`,
        checkedAt: new Date(),
      });
    }

    return StatusCheckResult.parse({
      id,
      status: "down" as const,
      responseTime,
      errorMessage,
      checkedAt: new Date(),
    });
  }
}

/**
 * 複数のエンドポイントを並行チェック
 */
export async function checkMultipleMonitors(
  monitors: Array<{ id: string; url: string }>,
  options: CheckOptions = {}
): Promise<StatusCheckResult[]> {
  const promises = monitors.map((monitor) =>
    checkMonitorStatus(monitor.id, monitor.url, options)
  );

  return Promise.all(promises);
}
