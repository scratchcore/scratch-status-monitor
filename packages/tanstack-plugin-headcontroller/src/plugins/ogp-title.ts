import type { ctxType } from "../controller";
import type { HeadType } from "../types";

/**
 * OGPのタイトルをページのタイトルに合わせるためのプラグイン
 * @param ctx
 * @param m
 * @returns
 */
export const ogpTitlePlugin = (ctx: ctxType, head: HeadType.index) => {
  const og = head.meta?.find((m) => m?.property === "og:title");
  const twitter = head.meta?.find((m) => m?.name === "twitter:title");
  if (og || twitter) {
    // 現在のタイトルを取得
    const title = {
      og: og?.content,
      twitter: twitter?.content,
    };

    // 設定を取得
    const config = ctx.context?.configs?.ogp?.mode;

    if (config === "use-meta-title") {
      title.og = ctx.values.title || title.og;
      title.twitter = ctx.values.title || title.twitter;
    }

    const ogpMeta = head.meta?.map((meta) => {
      if (meta === og) {
        return { ...meta, content: title.og };
      }
      if (meta === twitter) {
        return { ...meta, content: title.twitter };
      }
      return meta;
    });
    const updatedHead = {
      ...head,
      meta: ogpMeta,
    };
    return { ctx, head: updatedHead };
  }
  return { ctx, head };
};
