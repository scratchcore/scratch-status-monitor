import { OpenAPIGenerator } from "@orpc/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { router } from "./router";

const generator = new OpenAPIGenerator();

export const createOpenAPIRoutes = async () => {
  const app = new Hono();

  // OpenAPI スペックを生成
  const _spec = await generator.generate(router, {
    info: {
      title: "Scratch Status Monitor API",
      description: "API for monitoring Scratch projects status",
      version: "1.0.0",
    },
  });

  /**
   * Scalar API Reference エンドポイント
   * 注: openapi.json は index.ts で generateOpenAPISchema() を使用して提供
   */
  app.get(
    "/docs",
    Scalar({
      url: "/openapi.json",
      pageTitle: "Scratch Status Monitor API",
      _integration: "hono",
      hideClientButton: true,
      authentication: {
        preferredSecurityScheme: ["HTTP Bearer"],
        securitySchemes: {
          "HTTP Bearer": {
            type: "http",
            scheme: "bearer",
            token: "your-secret-token-here",
          },
        },
      },
    })
  );

  /**
   * ヘルスチェック・診断エンドポイント
   */
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
