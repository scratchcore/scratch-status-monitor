import { z } from "zod";
import envrc from "../../envrc";
import {
	type InferClientEnvType,
	type InferEnvType,
	createClientEnvSchema,
	createEnvSchema,
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
 * 環境変数を検証する
 */
function validateEnv<T extends z.ZodTypeAny>(
	env: Record<string, string | undefined>,
	schema: T,
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
export function getServerEnv(options: {
	throwOnError: true;
}): Env;
export function getServerEnv(options?: {
	throwOnError?: false;
}): Env | null;
export function getServerEnv(options?: {
	throwOnError?: boolean;
}): Env | null {
	if (typeof process === "undefined") {
		throw new Error("getServerEnv can only be called on the server side");
	}

	// envrc.tsの定義から動的に環境変数を取得
	const env: Record<string, string | undefined> = {};
	for (const key of Object.keys(envrc.env)) {
		env[key] = process.env[key];
	}

	const result = validateEnv(env, envSchema);

	if (!result.success) {
		const errorMessage = formatEnvError(result.errors);

		if (options?.throwOnError) {
			throw new Error(`Environment validation failed:\n${errorMessage}`);
		}

		console.error("❌ Environment validation failed:");
		console.error(errorMessage);
		return null;
	}

	return result.data as Env;
}

/**
 * クライアント側の環境変数を取得・検証
 */
export function getClientEnv(options: { throwOnError: true }): ClientEnv;
export function getClientEnv(options?: {
	throwOnError?: false;
}): ClientEnv | null;
export function getClientEnv(options?: {
	throwOnError?: boolean;
}): ClientEnv | null {
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

		if (options?.throwOnError) {
			throw new Error(`Environment validation failed:\n${errorMessage}`);
		}

		console.error("❌ Environment validation failed:");
		console.error(errorMessage);
		return null;
	}

	return result.data as ClientEnv;
}

/**
 * サーバーまたはクライアントの環境変数を自動判定して取得
 */
export function getEnv(options: { throwOnError: true }): Env;
export function getEnv(options?: { throwOnError?: false }): Env | null;
export function getEnv(options?: { throwOnError?: boolean }): Env | null {
	if (typeof process !== "undefined" && process.env) {
		if (options?.throwOnError === true) {
			return getServerEnv({ throwOnError: true });
		}
		return getServerEnv({ throwOnError: false });
	}
	if (options?.throwOnError === true) {
		return getClientEnv({ throwOnError: true }) as Env;
	}
	return getClientEnv({ throwOnError: false }) as Env | null;
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
 */
export function checkEnvOnStartup(): void {
	console.log("🔍 Checking environment variables...");

	const env = getServerEnv({ throwOnError: false });

	if (!env) {
		console.error("\n❌ Server startup aborted due to invalid environment.");
		console.error("Please fix the environment variables and try again.\n");
		process.exit(1);
	}
	console.log("✅ Environment variables validated successfully");
	// envrc.tsの定義から動的にログ出力
	for (const [key, varConfig] of Object.entries(envrc.env)) {
		const value = env[key as keyof typeof env];
		// masked: true の場合は値をマスク
		const isMasked = "masked" in varConfig && (varConfig as { masked?: boolean }).masked === true;
		const displayValue = isMasked
			? value
				? "***"
				: "not set"
			: value || "not set";
		console.log(`   ${key}: ${displayValue}`);
	}
	console.log("");
}
