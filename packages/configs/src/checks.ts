import type { ssmrcType } from "@scratchcore/ssm-types";

export const checks: ssmrcType.e.checks = {
  // ステータスチェックのタイムアウト時間（ミリ秒）
  timeoutMs: 10 * 1000, // 10秒
};
