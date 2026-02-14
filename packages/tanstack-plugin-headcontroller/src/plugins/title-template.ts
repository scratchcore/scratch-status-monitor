import type { PluginsType } from "../types/plugins";

export const titleTemplatePlugin = (ctx: Record<string, any>, m: PluginsType.head.meta.result) => {
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
        ctx.title = title;
      }
    }
    const result = {
      ...m,
      title,
    };
    console.log("titleTemplatePlugin result:", result);
    return { m: result, ctx };
  }
  return { m };
};
