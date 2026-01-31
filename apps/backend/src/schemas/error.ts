import { z } from "zod";

/**
 * APIエラーコード
 */
export const ErrorCodeEnum = z.enum([
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "INTERNAL_ERROR",
  "TIMEOUT",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "BAD_REQUEST",
]);

export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

/**
 * 統一エラーレスポンススキーマ
 */
export const ErrorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: ErrorCodeEnum,
    message: z.string(),
    details: z.any().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponse>;

/**
 * 成功レスポンス（データ付き）
 */
export const SuccessResponse = z.object({
  success: z.literal(true),
  data: z.any(),
});

export type SuccessResponse = z.infer<typeof SuccessResponse>;

/**
 * APIレスポンス（成功またはエラー）
 */
export const APIResponse = z.union([SuccessResponse, ErrorResponse]);

export type APIResponse = z.infer<typeof APIResponse>;

/**
 * エラーレスポンスの作成ヘルパー
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * 成功レスポンスの作成ヘルパー
 */
export function createSuccessResponse(data: any): SuccessResponse {
  return {
    success: true,
    data,
  };
}

/**
 * 標準的なエラーメッセージ
 */
export const ERROR_MESSAGES = {
  INVALID_INPUT: "入力パラメータが無効です",
  NOT_FOUND: "リソースが見つかりません",
  INTERNAL_ERROR: "内部エラーが発生しました",
  TIMEOUT: "リクエストがタイムアウトしました",
  UNAUTHORIZED: "認証が必要です",
  FORBIDDEN: "この操作は許可されていません",
} as const;
