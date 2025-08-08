import { z } from "@hono/zod-openapi";

/**
 * Forbidden (403)
 *
 * You are not authorized to access this resource / このリソースにアクセスする権限がありません
 */
export const ForbiddenError = z
  .object({
    type: z.url().meta({
      description: "URL",
      example: "https://datatracker.ietf.org/doc/rfc9457",
    }),
    status: z.number().meta({
      description: "HTTPステータスコード（403）",
      example: 403,
    }),
    title: z.string().optional().meta({
      description: "エラーのタイトル",
      example: "Forbidden",
    }),
    detail: z.unknown().optional().meta({
      description: "詳細エラー情報",
      example: "You are not authorized to access this resource.",
    }),
    "invalid-params": z
      .array(
        z.object({
          name: z
            .string()
            .meta({ description: "無効なパラメータ名", example: "token" }),
          reason: z
            .string()
            .meta({ description: "理由", example: "Missing or invalid" }),
          location: z
            .string()
            .optional()
            .meta({ description: "パラメータの位置", example: "header" }),
        }),
      )
      .optional()
      .meta({ description: "不正なパラメータの詳細リスト" }),
  })
  .loose() // ← 拡張用フィールドを受け入れる
  .meta({
    id: "ForbiddenError",
    description: "RFC 9457 (https://datatracker.ietf.org/doc/rfc9457) アクセス権限エラー",
    example: {
      type: "https://datatracker.ietf.org/doc/rfc9457",
      status: 403,
      title: "Forbidden",
      detail: "You are not authorized to access this resource.",
      "invalid-params": [
        {
          name: "token",
          reason: "Missing or invalid",
          location: "header",
        },
      ],
    },
  });

export type ForbiddenErrorType = z.infer<typeof ForbiddenError>;

export function createForbiddenError(data?: Partial<ForbiddenErrorType>) {
  return {
    type: "https://datatracker.ietf.org/doc/rfc9457",
    status: 403,
    title: "Forbidden",
    detail: "You are not authorized to access this resource.",
    ...data,
  };
}
