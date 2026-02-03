import { ssmrcType } from "./types";

export const cache: ssmrcType.cache = {
  // キャッシュの有効期限（ミリ秒）
  statusTtlMs: 5 * 60 * 1000, // 5分
  // KV Store への書き込み間隔（ミリ秒）
  kvWriteIntervalMs: 30 * 60 * 1000, // 30分
};
