import { requestMiddleware } from "@scracc/tanstack-plugin-logger";
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [requestMiddleware],
  };
});
