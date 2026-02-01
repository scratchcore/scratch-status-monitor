import { scracsmConfigType } from "./types";

export const cache: scracsmConfigType.cache = {
  // キャッシュの有効期限（ミリ秒）
  statusTtlMs: 5 * 60 * 1000, // 5分
};
