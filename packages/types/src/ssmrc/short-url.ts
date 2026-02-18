import z from "zod";

const __shortUrlSchema = z.object({
  /**
   * 短縮URLキー（パラメータ）
   * 例: "faq", "gh/repo"
   */
  key: z.string(),
  /**
   * リダイレクト先のURL
   */
  url: z.url(),
});
type __shortUrlType = z.infer<typeof __shortUrlSchema>;

export const _shortUrlSchema = {
  i: __shortUrlSchema,
};
export namespace _shortUrlType {
  export type i = __shortUrlType;
}
