import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { makeLog } from "@/utils/logger.js";
import { createUnauthorizedError } from "@/schemas/UnauthorizedError.js";

const log = makeLog();

export const customBearerAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const { NODE_ENV, DEV_SECRET_TOKEN, SECRET_TOKEN } = env<{
      NODE_ENV: string;
      DEV_SECRET_TOKEN?: string;
      SECRET_TOKEN?: string;
    }>(c);

    if (!SECRET_TOKEN) {
      log.error("SECRET_TOKEN を設定してください！");
      throw new Error();
    }

    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        createUnauthorizedError({
          detail: "認証情報が不足しています。",
        }),
        401,
      );
    }

    const token = authHeader.slice("Bearer ".length);

    if (NODE_ENV !== "production") {
      // c.res.headers.set("bearer-Auth", "skip");
      // return next();
      if (token !== DEV_SECRET_TOKEN) {
        return c.json(
          createUnauthorizedError({
            detail: "トークンが無効です。",
          }),
          401,
        );
      }
    } else {
      if (token !== SECRET_TOKEN) {
        return c.json(
          createUnauthorizedError({
            detail: "トークンが無効です。",
          }),
          401,
        );
      }
    }

    return next();
  };
};
