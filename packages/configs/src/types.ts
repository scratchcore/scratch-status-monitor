export namespace scracsmConfigType {
  export interface rc {
    category: category[];
    monitors: monitor[];
    history: history;
    cache: cache;
  }
  export interface category {
    id: string;
    label: string;
  }
  export interface monitor {
    id: string;
    label: string;
    category: string;
    url: string;
  }
  /**
   * 履歴保存の設定
   */
  export interface history {
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
  export interface cache {
    /**
     * ステータスレスポンスのキャッシュ有効期間（ミリ秒、デフォルト: 300000 = 5分）
     */
    statusTtlMs: number;
  }
}
