import { BProgress } from "@bprogress/core";
import { initHeadControllerConfigs } from "@scratchcore/tanstack-plugin-headcontroller";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { NotFoundComponent } from "./routes/$locale/404";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const headControllerConfig = initHeadControllerConfigs();

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
      ...headControllerConfig,
    },
    scrollRestorationBehavior: "smooth",
    defaultPreload: "intent",
    defaultNotFoundComponent: NotFoundComponent,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  router.subscribe("onBeforeLoad", ({ fromLocation, pathChanged }) => {
    // Don't show the progress bar on initial page load, seems like the onLoad event doesn't fire in that case
    fromLocation && pathChanged && BProgress.start();
  });
  router.subscribe("onLoad", () => {
    BProgress.done();
  });

  return router;
};
