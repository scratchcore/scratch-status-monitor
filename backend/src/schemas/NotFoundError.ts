import { z } from "@hono/zod-openapi";

/**
 * Not Found (404)
 *
 * The resource you are trying to access does not exist / アクセスしようとしているリソースは存在しません
 */
export const NotFoundError = z
  .object({
    type: z.url().meta({
      description: "URL",
      example: "https://datatracker.ietf.org/doc/rfc9457",
    }),
    status: z.number().meta({
      description: "HTTPステータスコード（404）",
      example: 404,
    }),
    title: z.string().optional().meta({
      description: "エラーのタイトル",
      example: "Not Found",
    }),
    detail: z.unknown().optional().meta({
      description: "詳細エラー情報",
      example: "The resource you are trying to access does not exist.",
    }),
    "invalid-params": z
      .array(
        z.object({
          name: z
            .string()
            .meta({ description: "無効なパラメータ名", example: "email" }),
          reason: z
            .string()
            .meta({ description: "理由", example: "Invalid format" }),
          location: z
            .string()
            .optional()
            .meta({ description: "パラメータの位置", example: "body" }),
        }),
      )
      .optional()
      .meta({ description: "不正なパラメータの詳細リスト" }),
  })
  .loose() // ← 拡張用フィールドを受け入れる
  .meta({
    id: "NotFoundError",
    description: "RFC 9457 (https://datatracker.ietf.org/doc/rfc9457) リソースが見つからないエラー",
    example: {
      type: "https://datatracker.ietf.org/doc/rfc9457",
      status: 404,
      title: "Not Found",
      detail: "The resource you are trying to access does not exist.",
      "invalid-params": [
        {
          name: "token",
          reason: "Missing or invalid",
          location: "header",
        },
      ],
    },
  });

export type NotFoundErrorType = z.infer<typeof NotFoundError>;

export function createNotFoundError(data?: Partial<NotFoundErrorType>) {
  return {
    type: "https://datatracker.ietf.org/doc/rfc9457",
    status: 404,
    title: "Not Found",
    detail: "The resource you are trying to access does not exist.",
    ...data,
  };
}
