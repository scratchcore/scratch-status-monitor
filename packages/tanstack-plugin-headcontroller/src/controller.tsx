import { useRouterState } from "@tanstack/react-router";
import { validateHeadControllerOptions } from "./context/validator";
import { collectHeadDataFromRoutes } from "./data";
import { ogpTitlePlugin } from "./plugins/ogp-title";
import { titleTemplatePlugin } from "./plugins/title-template";
import { HeadRender } from "./render";
import type { ContextType } from "./schema/context";
import type { HeadType } from "./types";

export type ctxType = {
  head: HeadType.index;
  context: ContextType.HeadControllerOptions;
  values: Record<string, any>;
};

export const HeadController = () => {
  const routes = useRouterState({ select: (s) => s.matches });
  const resolvedHead = collectHeadDataFromRoutes(routes);

  // 現在のルート
  const currentRouteData = [...routes].reverse().find((d) => d);

  const route = {
    context: validateHeadControllerOptions(currentRouteData?.context),
  };

  let ctx: ctxType = {
    head: resolvedHead,
    context: route.context,
    values: {},
  };
  const plugins = [titleTemplatePlugin, ogpTitlePlugin];
  const head = plugins.reduce((acc, plugin) => {
    const pluginResult = plugin(ctx, acc);
    ctx = {
      ...ctx,
      ...pluginResult,
    };
    return pluginResult.head;
  }, ctx.head);

  const result = {
    ...head,
  };
  return <HeadRender head={result} />;
};
