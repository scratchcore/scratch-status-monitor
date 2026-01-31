import { Hono } from "hono";
import { OpenAPIGenerator } from "@orpc/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { router } from "./router";

const generator = new OpenAPIGenerator();

export const createOpenAPIRoutes = async () => {
  const app = new Hono();

  // OpenAPI スペックを生成
  const spec = await generator.generate(router, {
    info: {
      title: "Scratch Status Monitor API",
      description: "API for monitoring Scratch projects status",
      version: "1.0.0",
    },
  });

  // OpenAPI スキーマエンドポイント
  app.get("/openapi.json", (c) => {
    return c.json(spec);
  });

  // Scalar API Reference エンドポイント
  app.get(
    "/docs",
    Scalar({
      url: "/openapi.json",
      pageTitle: "Scratch Status Monitor API",
      // https://github.com/scalar/scalar/blob/main/integrations/hono/src/scalar.ts
      _integration: "hono",
      hideClientButton: true,
    }),
  );

  // API ルート
  app.get("/health", async (c) => {
    const verbose = c.req.query("verbose") === "true";
    return c.json({
      status: "ok",
      message: verbose ? "Backend service is running" : "OK",
      timestamp: new Date(),
    });
  });

  app.get("/ping", async (c) => {
    return c.json({ pong: "pong" });
  });

  app.post("/echo", async (c) => {
    const body = await c.req.json();
    return c.json({ echo: body.message });
  });

  return app;
};
