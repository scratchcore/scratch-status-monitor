export namespace ssmrcType {
  export interface rc {
    category: category[];
    monitors: monitor[];
    checks: checks;
    cache: cache;
    shortUrls: shortUrl[];
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

  export interface cache {
    /**
     * ステータスレスポンスのキャッシュ有効期間（ミリ秒、デフォルト: 300000 = 5分）
     */
    statusTtlMs: number;
    /**
     * 履歴データのバケット間隔（ミリ秒）
     * v2.0: 時刻の切り捨て（floor）に使用
     * デフォルト: 300000 = 5分
     */
    bucketIntervalMs: number;
    /**
     * KV Store へのバックアップ間隔（ミリ秒）
     * v2.0: プロセスストレージ主体、KV はバックアップのみ
     * デフォルト: 1800000 = 30分
     */
    kvBackupIntervalMs: number;
    /**
     * データ保持期間（日数）
     * v2.0: メモリ上のデータを自動削除する基準
     * デフォルト: 7日
     */
    dataRetentionDays: number;
    /**
     * クリーンアップ実行間隔（ミリ秒）
     * v2.0: 古いデータを削除する定期処理の間隔
     * デフォルト: 3600000 = 1時間
     */
    cleanupIntervalMs: number;
  }

  export interface checks {
    /**
     * ステータスチェックのタイムアウト時間（ミリ秒）
     * デフォルト: 10000 = 10秒
     */
    timeoutMs: number;
  }

  export interface shortUrl {
    /**
     * 短縮URLキー（パラメータ）
     * 例: "faq", "gh/repo"
     */
    key: string;
    /**
     * リダイレクト先のURL
     */
    url: string;
  }
}
