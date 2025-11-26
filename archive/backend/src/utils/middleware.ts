import { createMiddleware } from "hono/factory";
import { makeLog } from "./logger.js";

export const responseTime = createMiddleware(async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  c.res.headers.set("X-Response-Time", `${end - start}`);
  c.res.headers.set("X-IS-DEV-MODE", `${c.env.NODE_ENV !== "production"}`);
});

export const logger = createMiddleware(async (c, next) => {
  const log = makeLog();
  log.info(`[${c.req.method}] ${c.req.url}`);
  await next();
});
