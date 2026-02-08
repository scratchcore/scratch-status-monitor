import type { z } from "zod";
import envrc from "../../envrc";
import {
  createClientEnvSchema,
  createEnvSchema,
  type InferClientEnvType,
  type InferEnvType,
} from "./schema";

/**
 * 環境変数スキーマ定義（envrc.tsから自動生成）
 */
const envSchema = createEnvSchema(envrc);

/**
 * クライアント側で使用可能な環境変数スキーマ
 * VITE_ プレフィックスが必要
 */
const clientEnvSchema = createClientEnvSchema(envrc);

/**
 * 環境変数の型（envrc.tsの設定から自動推論）
 */
export type Env = InferEnvType<typeof envrc>;
export type ClientEnv = InferClientEnvType<typeof envrc>;

/**
 * サーバー起動後の検証済み環境変数
 * checkEnvOnStartup() で初期化される
 */
let verifiedEnv: Env | null = null;

/**
 * 環境変数を検証する
 */
function validateEnv<T extends z.ZodTypeAny>(
  env: Record<string, string | undefined>,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(env);

  if (!result.success) {
    return {
      success: false,
      errors: result.error,
    };
  }

  return {
    success: true,
    data: result.data as z.infer<T>,
  };
}

/**
 * サーバー側の環境変数を取得・検証
 */
function validateAndGetServerEnv(): Env | null {
  if (typeof process === "undefined") {
    throw new Error("validateAndGetServerEnv can only be called on the server side");
  }

  // envrc.tsの定義から動的に環境変数を取得
  const env: Record<string, string | undefined> = {};
  for (const key of Object.keys(envrc.env)) {
    env[key] = process.env[key];
  }

  const result = validateEnv(env, envSchema);

  if (!result.success) {
    const errorMessage = formatEnvError(result.errors);
    console.error("❌ Environment validation failed:");
    console.error(errorMessage);
    return null;
  }

  return result.data as Env;
}

/**
 * クライアント側の環境変数を取得・検証
 */
function validateAndGetClientEnv(): ClientEnv | null {
  // envrc.tsの定義から動的に環境変数を取得（VITE_プレフィックスのみ）
  const env: Record<string, string | undefined> = {};
  for (const key of Object.keys(envrc.env)) {
    if (key.startsWith("VITE_")) {
      env[key] = import.meta.env[key] as string | undefined;
    }
  }

  const result = validateEnv(env, clientEnvSchema);

  if (!result.success) {
    const errorMessage = formatEnvError(result.errors);
    console.error("❌ Environment validation failed:");
    console.error(errorMessage);
    return null;
  }

  return result.data as ClientEnv;
}

/**
 * サーバーまたはクライアントの環境変数を自動判定して取得
 *
 * checkEnvOnStartup() で検証後は、必ず有効な環境変数オブジェクトを返す
 */
export function getEnv(): Env {
  // import.meta.env.SSR は Vite SSR モードでサーバー側は true、クライアント側は false
  if (import.meta.env.SSR) {
    // サーバーサイドの場合、キャッシュされた検証済み環境変数を返す
    if (verifiedEnv !== null) {
      return verifiedEnv;
    }

    const env = validateAndGetServerEnv();
    if (env === null) {
      throw new Error("Failed to validate server environment variables");
    }
    verifiedEnv = env;
    return env;
  }

  // クライアントサイドの場合は動的に検証
  const clientEnv = validateAndGetClientEnv();
  if (clientEnv === null) {
    throw new Error("Failed to validate client environment variables");
  }
  return clientEnv as unknown as Env;
}

/**
 * エラーメッセージをフォーマット
 */
function formatEnvError(error: z.ZodError): string {
  const lines = [""];

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    lines.push(`  • ${path}: ${issue.message}`);
  }

  lines.push("");
  lines.push("Please check your .env file or environment variables.");

  return lines.join("\n");
}

/**
 * サーバー起動時の環境変数チェック
 * app.config.ts や entry-server.tsx で呼び出す
 *
 * 検証に失敗した場合、プロセスを終了する
 */
export function checkEnvOnStartup(): void {
  console.log("🔍 Checking environment variables...");

  const env = validateAndGetServerEnv();

  if (!env) {
    console.error("\n❌ Server startup aborted due to invalid environment.");
    console.error("Please fix the environment variables and try again.\n");
    process.exit(1);
  }

  // 検証済みの環境変数をキャッシュ
  verifiedEnv = env;

  console.log("✅ Environment variables validated successfully");
  // envrc.tsの定義から動的にログ出力
  for (const [key, varConfig] of Object.entries(envrc.env)) {
    const value = env[key as keyof typeof env];
    // masked: true の場合は値をマスク
    const isMasked = "masked" in varConfig && (varConfig as { masked?: boolean }).masked === true;
    const displayValue = isMasked ? (value ? "***" : "not set") : value || "not set";
    console.log(`   ${key}: ${displayValue}`);
  }
  console.log("");
}
