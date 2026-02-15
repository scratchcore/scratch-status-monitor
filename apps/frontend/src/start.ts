import { createStart } from "@tanstack/react-start";
import { localeMiddleware } from "@/middleware/locale";

/**
 * TanStack Start インスタンス設定
 * グローバルミドルウェアを登録
 */
export const startInstance = createStart(() => {
  return {
    requestMiddleware: [localeMiddleware],
  };
});
