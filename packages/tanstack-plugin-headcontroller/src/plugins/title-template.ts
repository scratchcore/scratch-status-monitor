import type { ctxType } from "../controller";
import type { HeadType } from "../types";

export const titleTemplatePlugin = (ctx: ctxType, head: HeadType.index) => {
  const m = head.meta?.find((m) => m?.title);
  if (m?.title) {
    // 現在のタイトルを取得
    let title = m.title;

    // 設定を取得
    const config = ctx.context?.configs?.titleTemplate;

    // タイトルテンプレートの設定がある場合
    if (config?.template) {
      if (title !== config.default) {
        const template = config.template;
        title = template.replace("%s", title);
        ctx.values.title = title;
      }
    }
    const result = {
      ...m,
      title,
    };
    const updatedHead = {
      ...head,
      meta: head.meta?.map((meta) => (meta === m ? result : meta)),
    };
    return { ctx, head: updatedHead };
  }
  return { ctx, head };
};
