import type { ZodSchema } from "zod";

/**
 * APIエンドポイントのメタデータ定義型
 * OpenAPIドキュメント自動生成用
 */
export interface APIEndpointMetadata {
  /**
   * HTTPメソッド
   */
  method: "get" | "post" | "put" | "delete" | "patch";

  /**
   * エンドポイントパス（/api プレフィックスなし）
   */
  path: string;

  /**
   * OpenAPI タグ（カテゴリ分け）
   */
  tags: string[];

  /**
   * 短い説明（サマリー）
   */
  summary: string;

  /**
   * 詳細説明
   */
  description?: string;

  /**
   * オペレーションID（一意識別子）
   */
  operationId: string;

  /**
   * パラメータスキーマ（path, query）
   */
  parameters?: {
    path?: Record<string, ZodSchema>;
    query?: Record<string, ZodSchema>;
  };

  /**
   * リクエストボディスキーマ
   */
  requestBody?: {
    schema: ZodSchema;
    description?: string;
  };

  /**
   * レスポンススキーマ
   * ステータスコード → スキーマのマッピング
   */
  responses: {
    [statusCode: string]: {
      schema?: ZodSchema;
      description?: string;
    };
  };
}

/**
 * APIエンドポイントレジストリ
 * 全エンドポイントのメタデータを集約
 */
export const API_ENDPOINTS: APIEndpointMetadata[] = [];

/**
 * エンドポイントメタデータを登録
 */
export function registerEndpoint(metadata: APIEndpointMetadata): void {
  API_ENDPOINTS.push(metadata);
}

/**
 * パス形式の変換（HonoからOpenAPIへ）
 * /api/history/:monitorId → /api/history/{monitorId}
 */
export function convertPathToOpenAPI(path: string): string {
  return path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
}
