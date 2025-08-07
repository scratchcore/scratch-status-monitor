
import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { EnvStore, type EnvMap } from "./utils/envContext.js";

declare module "hono" {
  interface ContextVariableMap {
    env: EnvStore;
  }
}

export const envInjector: MiddlewareHandler = async (c, next) => {
  const { NODE_ENV } = env<EnvMap>(c);

  const envStore = new EnvStore();
  envStore.set("NODE_ENV", NODE_ENV);

  c.set("env", envStore);

  await next();
};