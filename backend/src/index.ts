// 設定/システム
import path from "node:path";
import fs from "node:fs";
import { projectConfig } from "project.config.js";
import { LogoText } from "@/utils/logo.js";
import { makeLog } from "@/utils/logger.js";
import { envInjector } from "./env.js";

// Hono
import { Hono } from "hono";
import { showRoutes } from "hono/dev";

// サーバー関係
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { except } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { customBearerAuth } from "./lib/customBearerAuth.js";

// APIルートなど
import { logger, responseTime } from "./utils/middleware.js";
import { ZodError } from "zod";

// ユーザー体系関係
import { languageDetector } from "hono/language";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import { MainRoutes } from "./routes/main.js";
import { openAPISpecs } from "hono-openapi";

const log = makeLog();

export const app = new Hono();

app.use(responseTime);
app.use(logger);
app.use(prettyJSON());
app.use(trimTrailingSlash());

// ユーザー言語: (https://hono.dev/docs/middleware/builtin/language)
app.use(
  languageDetector({
    supportedLanguages: ["ja", "en"], // Must include fallback
    fallbackLanguage: "ja", // Required
  }),
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
  }),
);

// CSRF保護 (https://hono.dev/docs/middleware/builtin/csrf)
app.use(
  csrf({
    origin: projectConfig.origin,
  }),
);

// 例外処理: (https://hono.dev/docs/api/exception)
app.notFound((c) => c.json({ message: "Not Found", success: false }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: "バリデーションエラーが発生しました。",
        issues: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400,
    );
  }
  return c.json(
    {
      success: false,
      message: "Internal Server Error",
      error: err instanceof Error ? err.message : String(err),
    },
    500,
  );
});

// 拡張環境変数コンテキスト
app.use(envInjector);
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// 認証ルート: (https://hono.dev/docs/middleware/builtin/bearer-auth)
app.use("/*", except(["/docs/*", "/openapi"], customBearerAuth(SECRET_TOKEN)));

app.route("/", MainRoutes);

// ドキュメント内容の生成
app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: projectConfig.title,
        version: projectConfig.version,
        description: fs.readFileSync(path.resolve("openapi.docs.md"), "utf-8"),
        contact: {
          name: "Developer",
          url: "https://github.com/scratchcore",
        },
        license: {
          name: "MIT",
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "TXT",
            description: "開発モードではこの認証はスキップされまず。",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [
        {
          url: `http://localhost:${projectConfig.port || 3000}`,
          description: "Local Server",
        },
      ],
      tags: [
        // {
        //   name: "Examples",
        //   description: fs.readFileSync(
        //     path.resolve("src/tags/Examples.md"),
        //     "utf8"
        //   ),
        // },
      ],
      externalDocs: {
        description: "Hello",
        url: "https://guides.scalar.com/scalar/introduction",
      },
    },
  }),
);

serve(
  {
    fetch: app.fetch,
    port: projectConfig.port,
  },
  async (info) => {
    await LogoText("ScratchCore");
    // ルートのログ出力
    showRoutes(app, {
      verbose: true,
    });
    console.log();
    log.info(`Server is running on http://localhost:${info.port}`);
  },
);
