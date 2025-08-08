import { Hono } from "hono";

import { z } from "@hono/zod-openapi";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { UnauthorizedError } from "@/schemas/UnauthorizedError.js";

export const examplesWelcome = new Hono();

const examplesWelcomeQuerySchema = z.object({
  name: z
    .string()
    .optional()
    .meta({ description: "The name of the user", example: "Steven" }),
});
const examplesWelcomeResponseSchema = z.string();

examplesWelcome.get(
  "/",
  describeRoute({
    summary: "Welcome",
    description: "Say hello to the user",
    tags: ["Examples"],
    validateResponse: true,
    responses: {
      200: {
        description: "OK",
        content: {
          "text/plain": {
            schema: resolver(
              examplesWelcomeResponseSchema,
              // z.union([
              //   examplesWelcomeQuerySchema,
              //   examplesWelcomeResponseSchema,
              // ]),
            ),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: resolver(UnauthorizedError),
          },
        },
      },
    },
  }),
  zValidator("query", examplesWelcomeQuerySchema),
  (c) => {
    const { name } = c.req.valid("query");
    return c.text(`Hello ${name ?? "Hono"}!`);
  },
);
