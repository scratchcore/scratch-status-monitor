/**
 * バックエンドのデフォルト値管理
 * 設定で指定されていない場合や、フォールバック値として使用
 */

export const BACKEND_DEFAULTS = {
  // ステータスチェック関連
  CACHE_INTERVAL_MS: 5 * 60 * 1000, // 5分
  TIMEOUT_MS: 10 * 1000, // 10秒

  // 履歴取得関連
  HISTORY_RECORDS_LIMIT: 10000, // 一度に取得する最大レコード数
} as const;
