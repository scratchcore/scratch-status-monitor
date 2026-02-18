import z from "zod";

const __checksSchema = z.object({
  /**
   * ステータスチェックのタイムアウト時間（ミリ秒）
   * デフォルト: 10000 = 10秒
   */
  timeoutMs: z.number().default(10000),
});
type __checksType = z.infer<typeof __checksSchema>;

export const _checksSchema = {
  i: __checksSchema,
};
export namespace _checksType {
  export type i = __checksType;
}
