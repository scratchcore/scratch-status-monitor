import { ssmrc } from "@scratchcore/ssm-configs";
import { getHistoryService } from "./historyService";

/**
 * v2.0: 定期クリーンアップサービス
 * 古いデータをメモリから削除して、メモリ使用量を最適化
 */

let cleanupIntervalId: NodeJS.Timeout | null = null;
let lastCleanupTime: number = 0;

/**
 * クリーンアップを実行
 */
export async function runCleanup(): Promise<void> {
  const now = Date.now();
  const retentionDays = ssmrc.cache.dataRetentionDays;

  console.log(`[CleanupService] Starting cleanup (retention: ${retentionDays} days)...`);

  try {
    const historyService = getHistoryService();
    await historyService.cleanup(retentionDays);
    
    lastCleanupTime = now;
    console.log("[CleanupService] Cleanup completed successfully");
  } catch (err) {
    console.error("[CleanupService] Cleanup failed:", err);
  }
}

/**
 * 定期クリーンアップを開始
 */
export function startPeriodicCleanup(): void {
  if (cleanupIntervalId) {
    console.log("[CleanupService] Periodic cleanup already running");
    return;
  }

  const intervalMs = ssmrc.cache.cleanupIntervalMs;
  
  console.log(`[CleanupService] Starting periodic cleanup (interval: ${intervalMs}ms = ${intervalMs / 60000} minutes)`);

  // 即座に1回実行
  runCleanup().catch(err => {
    console.error("[CleanupService] Initial cleanup failed:", err);
  });

  // 定期実行
  cleanupIntervalId = setInterval(() => {
    runCleanup().catch(err => {
      console.error("[CleanupService] Periodic cleanup failed:", err);
    });
  }, intervalMs);
}

/**
 * 定期クリーンアップを停止
 */
export function stopPeriodicCleanup(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log("[CleanupService] Periodic cleanup stopped");
  }
}

/**
 * クリーンアップの状態を取得
 */
export function getCleanupStatus(): {
  isRunning: boolean;
  lastCleanupTime: number | null;
  intervalMs: number;
  retentionDays: number;
} {
  return {
    isRunning: cleanupIntervalId !== null,
    lastCleanupTime: lastCleanupTime > 0 ? lastCleanupTime : null,
    intervalMs: ssmrc.cache.cleanupIntervalMs,
    retentionDays: ssmrc.cache.dataRetentionDays,
  };
}
