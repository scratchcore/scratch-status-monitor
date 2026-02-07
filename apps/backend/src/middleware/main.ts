import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { timeout } from "hono/timeout";

// 共通ミドルウェア設定
const mainMiddleware = new Hono();

// docs: https://hono.dev/docs/middleware/builtin/logger
mainMiddleware.use("*", logger());
// docs: https://hono.dev/docs/middleware/builtin/request-id
mainMiddleware.use("*", requestId());

// docs: https://hono.dev/docs/middleware/builtin/csrf
mainMiddleware.use(
  "*",
  csrf({
    origin: (origin) => /https:\/\/(\w+\.)?ssm\.scra\.cc$/.test(origin),
  }),
);

// docs: https://hono.dev/docs/middleware/builtin/timeout
mainMiddleware.use("*", timeout(10000)); // タイムアウトを10秒に設定
// docs: https://hono.dev/docs/middleware/builtin/pretty-json
mainMiddleware.use("*", prettyJSON());

export default mainMiddleware;
