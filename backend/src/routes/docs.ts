import { projectConfig } from "project.config.js";
import path from "node:path";
import fs from "node:fs";

import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Scalar } from "@scalar/hono-api-reference";

export const docsRoute = new Hono();

// ドキュメントページの設定
docsRoute.get(
  "/docs",
  basicAuth({
    username: "admin",
    password: "1",
  }),
  Scalar({
    url: "/openapi",
    layout: "modern",
    // Docs: https://github.com/scalar/scalar/blob/main/documentation/themes.md
    theme: "deepSpace",
    pageTitle: `${projectConfig.title} v${projectConfig.version}`,
    defaultHttpClient: {
      targetKey: "js",
      clientKey: "axios",
    },
    customCss: fs.readFileSync(path.resolve("public/style.css"), "utf8"),
    forceDarkModeState: "dark",
    hideDarkModeToggle: true,
    hideModels: true,
    hideDownloadButton: true,
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
  })
);
