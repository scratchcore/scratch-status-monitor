/**
 * API メタデータ関連の型定義
 */

/**
 * API エンドポイントのメタデータ
 */
export interface ApiMetadata {
  version: string;
  name: string;
  description?: string;
  timestamp: number; // Unix timestamp (ms)
}

/**
 * エラーレスポンス
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}
