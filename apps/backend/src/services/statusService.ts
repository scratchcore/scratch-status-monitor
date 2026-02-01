import { scracsmrc, scracsmConfigType } from "@scratchcore/scracsm-configs";
import type { StatusCheckResult as StatusCheckResultType } from "@scratchcore/scracsm-types";
import {
  CategoryStatus,
  MonitorStatus,
  type MonitorStatus as MonitorStatusType,
  type StatusLevel as StatusLevelType,
  StatusResponse,
} from "@scratchcore/scracsm-types";

/**
 * 複数のステータスから全体の状態を判定
 * - 1つ以上がdownなら全体down
 * - 1つ以上がdegradedなら全体degraded
 * - 全てupなら全体up
 */
function aggregateStatus(statuses: StatusLevelType[]): StatusLevelType {
  if (statuses.length === 0) return "unknown";

  if (statuses.some((s) => s === "down")) return "down";
  if (statuses.some((s) => s === "degraded")) return "degraded";
  if (statuses.every((s) => s === "up")) return "up";

  return "unknown";
}

/**
 * モニター構成とチェック結果からモニターステータスを構築
 */
export function buildMonitorStatus(
  config: scracsmConfigType.monitor,
  checkResult: StatusCheckResultType,
): MonitorStatusType {
  return MonitorStatus.parse({
    id: config.id,
    label: config.label,
    category: config.category,
    url: config.url,
    status: checkResult.status,
    statusCode: checkResult.statusCode,
    responseTime: checkResult.responseTime,
    errorMessage: checkResult.errorMessage,
    lastCheckedAt: checkResult.checkedAt,
  });
}

/**
 * カテゴリー別の集計を計算
 */
export function calculateCategoryStatus(
  category: scracsmConfigType.category,
  monitors: MonitorStatusType[],
): CategoryStatus {
  const categoryMonitors = monitors.filter((m) => m.category === category.id);

  const upCount = categoryMonitors.filter((m) => m.status === "up").length;
  const degradedCount = categoryMonitors.filter(
    (m) => m.status === "degraded",
  ).length;
  const downCount = categoryMonitors.filter((m) => m.status === "down").length;

  const statuses = categoryMonitors.map((m) => m.status);
  const overallStatus = aggregateStatus(statuses);

  return CategoryStatus.parse({
    id: category.id,
    label: category.label,
    status: overallStatus,
    itemCount: categoryMonitors.length,
    upCount,
    degradedCount,
    downCount,
  });
}

/**
 * 全体のステータスレスポンスを構築
 */
export function buildStatusResponse(
  monitors: MonitorStatusType[],
  cacheIntervalMs: number = 5 * 60 * 1000,
): StatusResponse {
  const categories = scracsmrc.category.map((cat) =>
    calculateCategoryStatus(cat, monitors),
  );

  const overallStatus = aggregateStatus(categories.map((c) => c.status));

  const now = new Date();
  const expiresAt = new Date(now.getTime() + cacheIntervalMs);

  return StatusResponse.parse({
    overallStatus,
    categories,
    monitors,
    timestamp: now,
    expiresAt,
  });
}
