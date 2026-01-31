export namespace MonitorConfigType {
  export interface Root {
    category: Category[];
    items: Item[];
    history?: HistoryConfig;
  }
  export interface Category {
    id: string;
    label: string;
  }
  export interface Item {
    id: string;
    label: string;
    category: string;
    url: string;
  }
  /**
   * 履歴保存の設定
   */
  export interface HistoryConfig {
    /**
     * 履歴を保持する日数（デフォルト: 30日）
     */
    retentionDays?: number;
    /**
     * 履歴に記録するモニターの最大数（デフォルト: 100）
     */
    maxRecords?: number;
    /**
     * 履歴自動削除を有効にするか（デフォルト: true）
     */
    autoCleanup?: boolean;
  }
}
