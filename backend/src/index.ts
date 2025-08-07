import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { makeLog } from "@/utils/logger.js";
import { LogoText } from "@/utils/logo.js";

const log = makeLog();

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  async (info) => {
    await LogoText("ScratchCore");
    log.info(`Server is running on http://localhost:${info.port}`);
  }
);
