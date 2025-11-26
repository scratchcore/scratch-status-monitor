import { z } from "@hono/zod-openapi";

/**
 * Unprocessable Entity (422)
 *
 * The request was invalid / リクエストは無効です / バリデーションエラー
 */
export const UnprocessableEntity = z
  .object({
    type: z.url().meta({
      description: "URL",
      example: "https://datatracker.ietf.org/doc/rfc9457",
    }),
    status: z.number().meta({
      description: "HTTPステータスコード（422）",
      example: 422,
    }),
    title: z.string().optional().meta({
      description: "エラーのタイトル",
      example: "Unprocessable Entity",
    }),
    detail: z.unknown().optional().meta({
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
    id: "UnprocessableEntity",
    description:
      "RFC 9457 (https://datatracker.ietf.org/doc/rfc9457) リクエストが処理できないエラー",
    example: {
      type: "https://datatracker.ietf.org/doc/rfc9457",
      status: 422,
      title: "Unprocessable Entity",
      detail: "The request was invalid.",
      "invalid-params": [
        {
          name: "email",
          reason: "Invalid format",
          location: "body",
        },
      ],
    },
  });

export type UnprocessableEntityType = z.infer<typeof UnprocessableEntity>;

export function createUnprocessableEntityError(
  data?: Partial<UnprocessableEntityType>,
) {
  return {
    type: "https://datatracker.ietf.org/doc/rfc9457",
    status: 422,
    title: "Unprocessable Entity",
    detail: "The request was invalid.",
    ...data,
  };
}
