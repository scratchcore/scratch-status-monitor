import { scracsmConfigType } from "./types";

// 履歴設定
export const history: scracsmConfigType.history = {
  retentionDays: 7, // ~日間のデータを保持
  maxRecords: 2100, // 最大~レコード
  autoCleanup: true, // 自動クリーンアップを有効
};
