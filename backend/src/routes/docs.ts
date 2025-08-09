import { projectConfig } from "project.config.js";
import path from "node:path";
import fs from "node:fs";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";

import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Scalar } from "@scalar/hono-api-reference";

export const docsRoute = new Hono();

docsRoute.get("/llms.txt", async (c) => {
  const content = fs.readFileSync(path.resolve("public/openapi.json"), "utf8");
  const markdown = await createMarkdownFromOpenApi(content);
  return c.text(markdown);
});

// ドキュメントページの設定
docsRoute.get(
  "/docs",
  basicAuth({
    username: "admin",
    password: "1",
  }),
  Scalar((c) => {
    return {
      // url: "/openapi",
      content: fs.readFileSync(path.resolve("public/openapi.yaml"), "utf8"),
      layout: "modern",
      // Docs: https://github.com/scalar/scalar/blob/main/documentation/themes.md
      // theme: "deepSpace",
      // https://github.com/scalar/scalar/tree/main/integrations/hono
      _integration: "hono",
      pageTitle: `${projectConfig.title} v${projectConfig.version}`,
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "axios",
      },
      transformers: ["zod"],
      // customCss: fs.readFileSync(path.resolve("public/style.css"), "utf8"),
      // forceDarkModeState: "dark",
      hideDarkModeToggle: false,
      hideModels: false,
      hideDownloadButton: false,
      hiddenClients: [
        "asynchttp",
        "clj_http",
        "cohttp",
        "ofetch",
        // "fetch",
        // "fetch",
        "guzzle",
        "http",
        "http1",
        "http1.1",
        "http2",
        "httpclient",
        "httpie",
        "httr",
        // "jquery",
        "libcurl",
        "native",
        "native",
        "native",
        "nethttp",
        "nsurlsession",
        "nsurlsession",
        "okhttp",
        "okhttp",
        // "python3",
        "request",
        "requests",
        "restmethod",
        "restsharp",
        // "undici",
        "unirest",
        "unirest",
        "webrequest",
        "wget",
        "xhr",
      ],
    };
  }),
);
