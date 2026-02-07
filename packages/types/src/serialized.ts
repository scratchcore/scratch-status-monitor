import type { z } from "zod";

/**
 * JSON シリアライズ用のヘルパー型
 * Date型をstring型に変換
 */
export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

/**
 * Zodスキーマから推論した型をシリアライズ形式に変換
 */
export type SerializedInfer<T extends z.ZodTypeAny> = Serialized<z.infer<T>>;
