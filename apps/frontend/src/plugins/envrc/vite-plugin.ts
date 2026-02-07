import type { Plugin } from "vite";

/**
 * 環境変数チェックプラグイン
 * サーバー起動時に環境変数の検証を行う
 */
export function envCheckPlugin(): Plugin {
  let hasChecked = false;

  return {
    name: "env-check",
    configResolved() {
      if (!hasChecked) {
        hasChecked = true;
        // 動的インポートで envrc をロード
        import("./index").then((module) => {
          module.checkEnvOnStartup();
        });
      }
    },
  };
}
