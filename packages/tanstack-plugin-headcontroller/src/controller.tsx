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

  const ctx = {
    context: route.context,
  };
  const head_meta = resolvedHead.meta?.map((m) => {
    return titleTemplatePlugin(ctx, m);
  });

  const result = {
    ...resolvedHead,
    meta: head_meta,
  };
  return <HeadRender head={result} />;
};
