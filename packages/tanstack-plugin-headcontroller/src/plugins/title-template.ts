import type { PluginsType } from "../types/plugins";

export const titleTemplatePlugin = (ctx: Record<string, any>, m: PluginsType.Head.Meta) => {
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
    return { ...m, title };
  }
  return m;
};
