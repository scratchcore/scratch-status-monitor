import { os } from "@orpc/server";
import { z } from "zod";

// プロシージャ定義
export const health = os
  .route({ method: "GET", path: "/health" })
  .input(
    z.object({
      verbose: z.boolean().optional(),
    })
  )
  .output(
    z.object({
      status: z.string(),
      message: z.string(),
      timestamp: z.date(),
    })
  )
  .handler(async ({ input }) => {
    return {
      status: "ok",
      message: input?.verbose ? "Backend service is running" : "OK",
      timestamp: new Date(),
    };
  });

export const ping = os
  .route({ method: "GET", path: "/ping" })
  .output(
    z.object({
      pong: z.string(),
    })
  )
  .handler(() => {
    return { pong: "pong" };
  });

export const echo = os
  .route({ method: "POST", path: "/echo" })
  .input(
    z.object({
      message: z.string(),
    })
  )
  .output(
    z.object({
      echo: z.string(),
    })
  )
  .handler(async ({ input }) => {
    return {
      echo: input.message,
    };
  });

export const router = {
  health,
  ping,
  echo,
};

export type Router = typeof router;
