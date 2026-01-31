import { getStatus, checkAllMonitors } from "../services/monitorService";
import { StatusResponse } from "../schemas/status";

/**
 * 現在のステータスを取得（キャッシュまたは最新チェック）
 */
export async function getStatusHandler(): Promise<StatusResponse> {
  return getStatus();
}

/**
 * 強制的にステータスをリフレッシュ
 */
export async function refreshStatusHandler(): Promise<StatusResponse> {
  return checkAllMonitors();
}

/**
 * 特定のモニターの詳細情報を取得
 */
export async function getMonitorDetailHandler(input: {
  monitorId: string;
}): Promise<(StatusResponse["monitors"][0] | undefined)> {
  const status = await getStatus();
  return status.monitors.find((m) => m.id === input.monitorId);
}
