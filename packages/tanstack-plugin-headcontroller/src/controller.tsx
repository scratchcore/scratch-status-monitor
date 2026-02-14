import { useRouterState } from "@tanstack/react-router";
import { validateHeadControllerOptions } from "./context/validator";
import { collectHeadDataFromRoutes } from "./data";
import { titleTemplatePlugin } from "./plugins/title-template";
import { HeadRender } from "./render";

export const HeadController = () => {
  const routes = useRouterState({ select: (s) => s.matches });
  const resolvedHead = collectHeadDataFromRoutes(routes);

  // 現在のルート
  const currentRouteData = [...routes].reverse().find((d) => d);

  const route = {
    context: validateHeadControllerOptions(currentRouteData?.context),
  };

  let ctx: Record<string, any> = {
    context: route.context,
  };
  const plugins = [titleTemplatePlugin];
  const head_meta = resolvedHead.meta?.map((m) => {
    return plugins.reduce((acc, plugin) => {
      const result = plugin(ctx, acc);
      ctx = result.ctx || ctx; // プラグインがctxを返す場合は更新
      return result.m;
    }, m);
  });

  const result = {
    ...resolvedHead,
    meta: head_meta,
  };
  console.log("HeadController result:", result.meta);
  return <HeadRender head={result} />;
};
