import type { MiddlewareHandler } from "hono";
import { makeLog } from "~/src/utils/logger";
import { createUnauthorizedError } from "~/src/schemas/UnauthorizedError";

const log = makeLog();

export const customBearerAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SECRET_TOKEN } = c.env;

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
        401
      );
    }

    const token = authHeader.slice("Bearer ".length);

    if (token !== SECRET_TOKEN) {
      return c.json(
        createUnauthorizedError({
          detail: "トークンが無効です。",
        }),
        401
      );
    }

    return next();
  };
};
