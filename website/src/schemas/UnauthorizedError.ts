import { z } from "zod";

/**
 * Unauthorized (401)
 *
 * You are not authorized to access this resource / このリソースにアクセスする権限がありません
 *
 *  RFC 6750（OAuth 2.0 Bearer Token Usage）が推奨されますが、レスポンス形式の統一を優先するために、RFC 9457 を使用しています。
 */
export const UnauthorizedError = z
  .object({
    type: z.url().meta({
      description: "URL",
      example: "https://datatracker.ietf.org/doc/rfc9457",
    }),
    status: z.number().meta({
      description: "HTTPステータスコード（401）",
      example: 401,
    }),
    title: z.string().meta({
      description: "エラーのタイトル",
      example: "Unauthorized",
    }),
    detail: z.string().optional().meta({
      description: "詳細エラー情報",
      example: "ログインが必要です。",
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
        })
      )
      .optional()
      .meta({ description: "不正なパラメータの詳細リスト" }),
  })
  .loose() // ← 拡張用フィールドを受け入れる
  .meta({
    id: "UnauthorizedError",
    description:
      "RFC 9457 (https://datatracker.ietf.org/doc/rfc9457) アクセス権限エラー",
    example: {
      type: "https://datatracker.ietf.org/doc/rfc9457",
      status: 401,
      title: "Unauthorized",
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

export type UnauthorizedErrorType = z.infer<typeof UnauthorizedError>;

export function createUnauthorizedError(data?: Partial<UnauthorizedErrorType>) {
  return {
    type: "https://datatracker.ietf.org/doc/rfc9457",
    status: 401,
    title: "Unauthorized",
    detail: "You are not authorized to access this resource.",
    ...data,
  };
}
