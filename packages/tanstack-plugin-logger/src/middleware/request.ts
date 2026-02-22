import { createMiddleware } from "@tanstack/react-start";
import { logger } from "../logger";

export const requestMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
  const result = await next();

  const requestId = crypto.randomUUID();

  result.response.headers.set("X-Request-ID", requestId);

  return result;
});

export const debugMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();

  if (process.env.NODE_ENV === "development") {
    result.response.headers.set("X-Debug-Timestamp", new Date().toISOString());
    result.response.headers.set("X-Debug-Node-Version", process.version);
    result.response.headers.set("X-Debug-Uptime", process.uptime().toString());
  }

  return result;
});

export const requestLogger = createMiddleware().server(async ({ request, next }) => {
  const startTime = Date.now();

  logger(
    {
      level: "info",
      name: "REQUEST",
    },
    `${request.method} ${request.url} - Starting`
  );

  try {
    const result = await next();
    const duration = Date.now() - startTime;

    logger(
      {
        level: "info",
        name: "REQUEST",
      },
      `${request.method} ${result.response.status} - ${request.url} (${duration}ms)`
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger(
      {
        level: "error",
        name: "REQUEST",
      },
      `${request.method} ${request.url} - Error (${duration}ms):`,
      error
    );
    throw error;
  }
});
