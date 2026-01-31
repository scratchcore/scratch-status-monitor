import { MonitorConfig } from "../motitors";
import { buildMonitorStatus, buildStatusResponse } from "./statusService";
import { checkMultipleMonitors } from "./statusChecker";
import { getCacheService } from "./cacheService";
import type { StatusResponse } from "../schemas/status";

/**
 * 全てのモニターをチェックして、ステータスを更新
 */
export async function checkAllMonitors(): Promise<StatusResponse> {
  // 設定からチェック対象を構築
  const monitorsToCheck = MonitorConfig.items.map((item) => ({
    id: item.id,
    url: item.url,
  }));

  // 並行してチェック実行
  const checkResults = await checkMultipleMonitors(monitorsToCheck, {
    timeout: 10000,
  });

  // チェック結果からモニターステータスを構築
  const monitors = checkResults.map((result) => {
    const config = MonitorConfig.items.find((item) => item.id === result.id)!;
    return buildMonitorStatus(config, result);
  });

  // ステータスレスポンスを構築
  const statusResponse = buildStatusResponse(MonitorConfig, monitors);

  // キャッシュに保存
  const cacheService = getCacheService();
  await cacheService.set(statusResponse);

  return statusResponse;
}

/**
 * キャッシュされたステータスを取得、なければ新規チェック実行
 */
export async function getStatus(): Promise<StatusResponse> {
  const cacheService = getCacheService();
  const cached = await cacheService.get();

  if (cached) {
    return cached;
  }

  return checkAllMonitors();
}

/**
 * キャッシュをクリア
 */
export async function clearCache(): Promise<void> {
  const cacheService = getCacheService();
  await cacheService.delete();
}
