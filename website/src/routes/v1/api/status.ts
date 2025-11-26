import { Hono } from "hono";
import ky, { isHTTPError, isTimeoutError } from "ky";
import { MonitorConfig } from "~/motitors";
import { customBearerAuth } from "~/src/lib/customBearerAuth";

export const statusRoute = new Hono();

statusRoute.get("/check", customBearerAuth(), async (c) => {
  const result = await checkStatus();
  return c.json(result);
});

export async function checkStatus() {
  const results = [];
  for (const m of MonitorConfig.items) {
    console.log("Checking", m.id);
    const _startTime = Date.now();
    let ok = false;
    let statusCode = 0;
    let timedOut = false;
    let errorType: string | null = null;
    let errorMessage: string | null = null;
    try {
      const result = await ky.get(m.url, { timeout: 5000 });
      ok = true;
      statusCode = result.status;
    } catch (e) {
      console.log("-> ERROR", e);
      // ky provides helpers to detect errors, but there are also network/request errors
      if (isTimeoutError(e)) {
        ok = false;
        timedOut = true;
        statusCode = 0; // or 408 if you prefer
        errorType = "timeout";
        errorMessage = e.message ?? String(e);
      } else if (isHTTPError(e)) {
        ok = false;
        // @ts-ignore
        statusCode = e.response?.status ?? 0;
        errorType = "http";
        errorMessage = e.message ?? String(e);
      } else {
        ok = false;
        statusCode = 0;
        errorType = e && (e as any).remote ? "cloudflare_internal" : "network";
        errorMessage = (e as any).message ?? String(e);
      }
    } finally {
      const latency = Date.now() - _startTime;
      const data: any = {
        id: m.id,
        url: m.url,
        category: m.category,
        title: m.title,
        latency,
        ok,
        statusCode,
        timeout: timedOut,
      };

      // only include error when present
      if (errorType || errorMessage) {
        data.error = {
          type: errorType,
          message: errorMessage,
        };
      }

      results.push(data);
      console.log("->", latency + "ms");
    }
  }
  return results;
}
