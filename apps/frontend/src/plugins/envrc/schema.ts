import { z } from "zod";

/**
 * 環境変数の型
 */
export type EnvVarType = "text" | "url" | "number" | "email" | "port";

/**
 * 環境変数の定義
 */
export interface EnvVarConfig {
  /** この環境変数が必須かどうか */
  required: boolean;
  /** 環境変数の説明 */
  description: string;
  /** 環境変数の型（デフォルト: text） */
  type?: EnvVarType;
  /** デフォルト値（任意） */
  default?: string;
  /** ログ出力時にマスクするか（機密情報の場合true） */
  masked?: boolean;
  /** バリデーション関数（任意） */
  validate?: (value: string) => boolean | string;
}

/**
 * 環境変数設定のマップ
 */
export interface EnvConfig {
  env: Record<string, EnvVarConfig>;
}

/**
 * EnvConfigから型を抽出するヘルパー型
 * required: true または default が指定されている場合は string、それ以外は string | undefined
 */
export type InferEnvType<T extends EnvConfig> = {
  [K in keyof T["env"] as string extends K ? never : K]: T["env"][K]["required"] extends true
    ? string
    : T["env"][K]["default"] extends string
      ? string
      : string | undefined;
};

/**
 * クライアント側の環境変数型を抽出（VITE_プレフィックスのみ）
 * required: true または default が指定されている場合は string、それ以外は string | undefined
 */
export type InferClientEnvType<T extends EnvConfig> = {
  [K in keyof T["env"] as K extends `VITE_${string}`
    ? string extends K
      ? never
      : K
    : never]: T["env"][K]["required"] extends true
    ? string
    : T["env"][K]["default"] extends string
      ? string
      : string | undefined;
};

/**
 * 環境変数設定を定義するヘルパー関数
 */
export function defineConfig<T extends EnvConfig>(config: T): T {
  return config;
}

/**
 * 環境変数設定からZodスキーマを生成する
 */
export function createEnvSchema<T extends EnvConfig>(config: T) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, varConfig] of Object.entries(config.env)) {
    let schema: z.ZodTypeAny;

    // 型に基づいてバリデーションを適用
    const varType = varConfig.type || "text";
    switch (varType) {
      case "url":
        schema = z.url();
        break;
      case "email":
        schema = z.email();
        break;
      case "number":
        schema = z.string().regex(/^\d+$/, "Must be a number");
        break;
      case "port":
        schema = z
          .string()
          .regex(/^\d+$/)
          .refine(
            (val) => {
              const port = Number(val);
              return port >= 1 && port <= 65535;
            },
            { message: "Port must be between 1 and 65535" }
          );
        break;
      default:
        schema = z.string();
        break;
    }

    // カスタムバリデーション
    if (varConfig.validate) {
      schema = schema.refine(
        (val) => {
          const result = varConfig.validate?.(val as string);
          return result === true;
        },
        {
          message: typeof varConfig.validate === "function" ? "Validation failed" : "Invalid value",
        }
      );
    }

    // 必須でない場合はoptionalにする
    if (!varConfig.required) {
      schema = schema.optional();
      // デフォルト値がある場合は設定
      if (varConfig.default !== undefined) {
        schema = schema.default(varConfig.default);
      }
    }

    shape[key] = schema;
  }

  return z.object(shape);
}

/**
 * クライアント側の環境変数のみをフィルタリング
 */
export function createClientEnvSchema<T extends EnvConfig>(config: T) {
  const clientShape: Record<string, z.ZodTypeAny> = {};

  for (const [key, varConfig] of Object.entries(config.env)) {
    // VITE_プレフィックスがある環境変数のみ
    if (!key.startsWith("VITE_")) {
      continue;
    }

    let schema: z.ZodTypeAny;

    // 型に基づいてバリデーションを適用
    const varType = varConfig.type || "text";
    switch (varType) {
      case "url":
        schema = z.url();
        break;
      case "email":
        schema = z.email();
        break;
      case "number":
        schema = z.string().regex(/^\d+$/, "Must be a number");
        break;
      case "port":
        schema = z
          .string()
          .regex(/^\d+$/)
          .refine(
            (val) => {
              const port = Number(val);
              return port >= 1 && port <= 65535;
            },
            { message: "Port must be between 1 and 65535" }
          );
        break;
      default:
        schema = z.string();
        break;
    }

    if (varConfig.validate) {
      schema = schema.refine(
        (val) => {
          const result = varConfig.validate?.(val as string);
          return result === true;
        },
        {
          message: "Validation failed",
        }
      );
    }

    if (!varConfig.required) {
      schema = schema.optional();
      if (varConfig.default !== undefined) {
        schema = schema.default(varConfig.default);
      }
    }

    clientShape[key] = schema;
  }

  return z.object(clientShape);
}

/**
 * 環境変数の説明を取得
 */
export function getEnvDescription<T extends EnvConfig>(config: T, key: string): string {
  return config.env[key]?.description || "";
}

/**
 * 必須環境変数のリストを取得
 */
export function getRequiredEnvKeys<T extends EnvConfig>(config: T): string[] {
  return Object.entries(config.env)
    .filter(([_, varConfig]) => varConfig.required)
    .map(([key]) => key);
}

/**
 * すべての環境変数のドキュメントを生成
 */
export function generateEnvDocs<T extends EnvConfig>(config: T): string {
  const lines: string[] = ["# Environment Variables", ""];

  for (const [key, varConfig] of Object.entries(config.env)) {
    const required = varConfig.required ? "**Required**" : "*Optional*";
    const defaultValue = varConfig.default ? ` (default: ${varConfig.default})` : "";

    lines.push(`## ${key}`);
    lines.push(`${required}${defaultValue}`);
    lines.push("");
    lines.push(varConfig.description);
    lines.push("");
  }

  return lines.join("\n");
}
