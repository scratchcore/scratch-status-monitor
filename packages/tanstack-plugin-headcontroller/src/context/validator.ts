import { ContextSchema, type ContextType } from "../schema/context";

/**
 * コンテキストを検証するための関数を定義するモジュール
 */
export const validateHeadControllerOptions = (c: any): ContextType.HeadControllerOptions => {
  const result = ContextSchema.options.safeParse(c.headController);
  if (!result.success) {
    throw new Error(`Invalid headController options: ${result.error.message}`);
  }
  return result.data;
};
