import { createStart } from "@tanstack/react-start";
import { localeMiddleware } from "@/middleware/locale";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [localeMiddleware],
  };
});
