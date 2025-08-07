import { Hono } from "hono";

import { z } from "@hono/zod-openapi";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";

export const examplesWelcome = new Hono();

const examplesWelcomeQuerySchema = z
  .object({
    name: z.string().optional().openapi({ example: "Steven" }),
  })
  .meta({ ref: "ExamplesWelcomeQuery" });

const examplesWelcomeResponseSchema = z
  .string()
  .meta({ ref: "ExamplesWelcomeResponse" });

examplesWelcome.get(
  "/",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful greeting response",
        content: {
          "text/plain": {
            schema: resolver(
              z.union([
                examplesWelcomeQuerySchema,
                examplesWelcomeResponseSchema,
              ])
            ),
          },
        },
      },
    },
  }),
  zValidator("query", examplesWelcomeQuerySchema),
  (c) => {
    const query = c.req.valid("query");
    return c.text(`Hello ${query?.name ?? "Hono"}!`);
  }
);
