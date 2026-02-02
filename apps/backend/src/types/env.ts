/**
 * Cloudflare Workers 環境変数の型定義
 */
export interface Env {
  /**
   * KV Namespace バインディング
   */
  SCRAC_SSM_KV: KVNamespace;

  /**
   * API Bearer 認証トークン
   * 環境変数: API_TOKEN
   */
  API_TOKEN?: string;

  /**
   * 環境モード
   * development: 開発環境（テストルート有効）
   * production: 本番環境（テストルート無効）
   */
  ENVIRONMENT?: "development" | "production";
}
