import type { Plugin } from "vite";
import { checkEnvOnStartup } from "./index";

/**
 * 環境変数チェックプラグイン
 * サーバー起動時に環境変数の検証を行う
 *
 * 環境変数が無効な場合、プラグイン設定時にサーバーを停止します
 */
export function envCheckPlugin(): Plugin {
  let hasChecked = false;

  return {
    name: "env-check",
    configResolved() {
      if (!hasChecked) {
        hasChecked = true;
        // 同期的に環境変数をチェック
        // 無効な場合はこの時点で process.exit(1) でサーバーを停止
        checkEnvOnStartup();
      }
    },
  };
}
