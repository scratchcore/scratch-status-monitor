import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";

export const customBearerAuth = (expectedToken?: string): MiddlewareHandler => {
  return async (c, next) => {
    const { NODE_ENV } = env<{ NODE_ENV: string }>(c);

    const authHeader = c.req.header("Authorization");

    if (!authHeader || authHeader.startsWith("Bearer ")) {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          {
            success: false,
            message: "認証情報が不足しています。",
          },
          401,
        );
      }
    } else {
      const isDev = NODE_ENV !== "production";
      if (isDev) {
        c.res.headers.set("bearer-Auth", "skip");
        return next();
      }
    }

    const token = authHeader.slice("Bearer ".length);

    if (token !== expectedToken) {
      return c.json(
        {
          success: false,
          message: "トークンが無効です。",
        },
        401,
      );
    }

    await next();
  };
};
