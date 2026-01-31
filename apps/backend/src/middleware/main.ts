import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

// 共通ミドルウェア設定
const mainMiddleware = new Hono();

// docs: https://hono.dev/docs/middleware/builtin/pretty-json
mainMiddleware.use("*", prettyJSON());
// docs: https://hono.dev/docs/middleware/builtin/request-id
mainMiddleware.use("*", requestId());

export default mainMiddleware;
