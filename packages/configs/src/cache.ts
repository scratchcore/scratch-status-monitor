import type { ssmrcType } from "./types";

export const cache: ssmrcType.cache = {
  // キャッシュの有効期限（ミリ秒）
  statusTtlMs: 5 * 60 * 1000, // 5分
  // 履歴データのバケット間隔（ミリ秒）- v2.0: 時刻の切り捨てに使用
  bucketIntervalMs: 5 * 60 * 1000, // 5分
  // KV Store への書き込み間隔（ミリ秒）- v2.0: バックアップ専用
  kvBackupIntervalMs: 30 * 60 * 1000, // 30分
  // データ保持期間（日数）- v2.0: メモリ管理用
  dataRetentionDays: 7, // 7日間
  // クリーンアップ実行間隔（ミリ秒）- v2.0: 古いデータの自動削除
  cleanupIntervalMs: 60 * 60 * 1000, // 1時間
};
