import { projectConfig } from "~/project.config";

import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import { languageDetector } from "hono/language";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";

import { ZodError } from "zod";
import { createNotFoundError } from "./schemas/NotFoundError";
import { createUnprocessableEntityError } from "./schemas/UnprocessableEntity";
import { createBadRequestError } from "./schemas/BadRequestError";

import { MainRoutes } from "./routes/route";

const app = new Hono();

app.use(prettyJSON());
app.use(trimTrailingSlash());

// ユーザー言語: (https://hono.dev/docs/middleware/builtin/language)
app.use(
  languageDetector({
    supportedLanguages: ["ja", "en"], // Must include fallback
    fallbackLanguage: "ja", // Required
  })
);

// CORS: (https://hono.dev/docs/middleware/builtin/cors)
app.use(
  "/*",
  cors({
    origin: `https://${projectConfig.origin}`,
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

// CSRF保護 (https://hono.dev/docs/middleware/builtin/csrf)
app.use(
  csrf({
    origin: projectConfig.origin,
  })
);

// 例外処理: (https://hono.dev/docs/api/exception)
app.notFound((c) => c.json(createNotFoundError(), 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof ZodError) {
    return c.json(
      createUnprocessableEntityError({
        title: "バリデーションエラーが発生しました。",
        errors: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }),
      422
    );
  }
  return c.json(
    createBadRequestError({
      title: "Internal Server Error",
      detail: err instanceof Error ? err.message : String(err),
    }),
    500
  );
});

app.route("/", MainRoutes);

export default app;
