import { z } from "@hono/zod-openapi";

/**
 * Bad Request (400)
 *
 * The request was invalid / リクエストは無効です
 */
export const BadRequestError = z
  .object({
    type: z.url().meta({
      description: "URL",
      example: "https://datatracker.ietf.org/doc/rfc9457",
    }),
    status: z.number().meta({
      description: "HTTPステータスコード（400）",
      example: 400,
    }),
    title: z.string().meta({
      description: "エラーのタイトル",
      example: "Bad Request",
    }),
    detail: z.string().optional().meta({
      description: "詳細エラー情報",
      example: "The request was invalid.",
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
    id: "BadRequestError",
    description:
      "RFC 9457 (https://datatracker.ietf.org/doc/rfc9457) リクエストエラー",
    example: {
      type: "https://datatracker.ietf.org/doc/rfc9457",
      status: 400,
      title: "Bad Request",
      detail: "The request was invalid.",
      "invalid-params": [
        {
          name: "token",
          reason: "Missing or invalid",
          location: "header",
        },
      ],
    },
  });

export type BadRequestErrorType = z.infer<typeof BadRequestError>;

export function createBadRequestError(data?: Partial<BadRequestErrorType>) {
  return {
    type: "https://datatracker.ietf.org/doc/rfc9457",
    status: 400,
    title: "Bad Request",
    detail: "The request was invalid.",
    ...data,
  };
}
