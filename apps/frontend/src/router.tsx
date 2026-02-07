import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { BProgress } from "@bprogress/core";

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
    },
    scrollRestorationBehavior: "smooth",
    defaultPreload: "intent",
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
