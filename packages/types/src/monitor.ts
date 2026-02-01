/**
 * モニター関連の型定義
 */

/**
 * モニター設定
 */
export interface MonitorConfig {
  id: string;
  name: string;
  url: string;
  interval: number; // seconds
  timeout: number; // seconds
  retries?: number;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * モニター情報
 */
export interface Monitor extends MonitorConfig {
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
  lastCheck?: number; // Unix timestamp (ms)
}

/**
 * モニターグループ
 */
export interface MonitorGroup {
  id: string;
  name: string;
  description?: string;
  monitors: Monitor[];
  createdAt: number;
  updatedAt: number;
}
