import { Hono } from "hono";
import type { Env } from "../types/env";
import { getCacheService } from "../services/cacheService";
import { getHistoryService } from "../services/historyService";
import { getCleanupStatus } from "../services/cleanupService";
import { BACKEND_DEFAULTS } from "../config/defaults";

/**
 * v2.0: デバッグ・監視用 API ルート
 * メモリ使用量やシステム状態を確認
 */

const debugRouter = new Hono<{ Bindings: Env }>();

/**
 * メモリ使用量とシステム状態を取得
 */
debugRouter.get("/memory", async (c) => {
  try {
    const historyService = getHistoryService();
    
    // 全モニターの履歴を取得して統計を計算
    const monitorIds = ["project-api", "scratch-api"]; // TODO: 動的に取得
    let totalRecords = 0;
    let oldestRecord: Date | null = null;
    let newestRecord: Date | null = null;
    
    for (const monitorId of monitorIds) {
      const records = await historyService.getRecords(monitorId, BACKEND_DEFAULTS.HISTORY_RECORDS_LIMIT);
      totalRecords += records.length;
      
      if (records.length > 0) {
        const oldest = new Date(records[0].recordedAt);
        const newest = new Date(records[records.length - 1].recordedAt);
        
        if (!oldestRecord || oldest < oldestRecord) {
          oldestRecord = oldest;
        }
        if (!newestRecord || newest > newestRecord) {
          newestRecord = newest;
        }
      }
    }
    
    // 推定メモリ使用量（1レコード約180bytes）
    const estimatedMB = (totalRecords * 180) / (1024 * 1024);
    
    // クリーンアップ状態
    const cleanupStatus = getCleanupStatus();
    
    return c.json({
      memory: {
        totalRecords,
        estimatedMB: estimatedMB.toFixed(2),
        percentOfLimit: ((estimatedMB / 128) * 100).toFixed(2) + "%",
      },
      records: {
        oldest: oldestRecord?.toISOString() || null,
        newest: newestRecord?.toISOString() || null,
        monitorCount: monitorIds.length,
      },
      cleanup: {
        isRunning: cleanupStatus.isRunning,
        lastCleanup: cleanupStatus.lastCleanupTime 
          ? new Date(cleanupStatus.lastCleanupTime).toISOString() 
          : null,
        intervalMinutes: cleanupStatus.intervalMs / 60000,
        retentionDays: cleanupStatus.retentionDays,
      },
      system: {
        cloudflareMemoryLimit: "128 MB",
        recommendedMonitors: "10-50",
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * クリーンアップを手動実行
 */
debugRouter.post("/cleanup", async (c) => {
  try {
    const { runCleanup } = await import("../services/cleanupService");
    await runCleanup();
    
    return c.json({
      success: true,
      message: "Cleanup executed successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * KV バックアップ状態を確認
 */
debugRouter.get("/backup-status", async (c) => {
  if (!c.env.SCRAC_SSM_KV) {
    return c.json({
      error: "KV Store not available",
    }, { status: 503 });
  }

  try {
    const cacheBackup = await c.env.SCRAC_SSM_KV.get("backup:cache:snapshot", "json");
    const historyBackup = await c.env.SCRAC_SSM_KV.get("backup:histories:snapshot", "json");
    
    return c.json({
      cache: {
        exists: !!cacheBackup,
        entries: cacheBackup ? Object.keys(cacheBackup).length : 0,
      },
      history: {
        exists: !!historyBackup,
        monitors: historyBackup ? Object.keys(historyBackup).length : 0,
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export default debugRouter;
