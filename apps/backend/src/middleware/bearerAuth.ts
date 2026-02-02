import { bearerAuth } from "hono/bearer-auth";
import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../types/env";

/**
 * Bearer 認証ミドルウェア
 * 環境に応じて認証の適用範囲を変更
 *
 * 本番環境 (ENVIRONMENT=production):
 * - 全てのルートに認証を適用
 *
 * 開発環境 (ENVIRONMENT=development):
 * - テストルート (/test/*) は認証なし
 * - ドキュメントルート (/docs, /openapi.json) は認証なし
 * - その他のルートには認証を適用
 */
export function createBearerAuthMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c: Context<{ Bindings: Env }>, next) => {
    const token = c.env.API_TOKEN;
    const environment = c.env.ENVIRONMENT || "development";
    const path = c.req.path;

    // トークンが設定されていない場合は認証をスキップ
    if (!token) {
      console.warn(
        "API_TOKEN is not set. Bearer authentication is disabled. Set API_TOKEN in environment variables to enable authentication.",
      );
      return next();
    }

    // 開発環境では特定のパスを認証から除外
    if (environment === "development") {
      const isTestRoute = path.startsWith("/test/");
      const isDocsRoute = path === "/docs" || path.startsWith("/docs/") || path === "/openapi.json";
      const isRootRoute = path === "/";

      if (isTestRoute || isDocsRoute || isRootRoute) {
        return next();
      }
    }

    // Bearer 認証を適用
    const authMiddleware = bearerAuth({ token });
    return authMiddleware(c, next);
  };
}
