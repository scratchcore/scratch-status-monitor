import type { ContextType } from "../schema/context";

/**
 * ルートまたはページのコンテキストにHeadControllerの設定を追加します。
 *
 * @param opts
 * @return {_HeadControllerContext}
 */
export const initHeadControllerConfigs = (
  opts?: ContextType.HeadControllerOptions
): ContextType.HeadControllerContext => {
  return {
    headController: opts || {},
  };
};
