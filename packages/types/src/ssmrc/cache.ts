import z from "zod";

const __cacheSchema = z.object({
  /**
   * ステータスレスポンスのキャッシュ有効期間（ミリ秒、デフォルト: 300000 = 5分）
   */
  statusTtlMs: z.number().default(300000),
  /**
   * 履歴データのバケット間隔（ミリ秒）
   * v2.0: 時刻の切り捨て（floor）に使用
   * デフォルト: 300000 = 5分
   */
  bucketIntervalMs: z.number().default(300000),
  /**
   * データ保持期間（日数）
   * v2.0: メモリ上のデータを自動削除する基準
   * デフォルト: 7日
   */
  dataRetentionDays: z.number().default(7),
});
type __cacheType = z.infer<typeof __cacheSchema>;

export const _cacheSchema = {
  i: __cacheSchema,
};
export namespace _cacheType {
  export type i = __cacheType;
}
