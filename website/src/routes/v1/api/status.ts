import { Hono } from "hono";
import ky, { isHTTPError, isTimeoutError } from "ky";
import { MonitorConfig } from "~/motitors";
import { customBearerAuth } from "~/src/lib/customBearerAuth";
import { getStatusCache, setStatusCache } from "~/src/lib/statusCache";
import { projectConfig } from "~/project.config";
import { RenderFragment } from "~/src/ssr/render";

export const statusRoute = new Hono();

// The /check route has been removed as per the new requirements.

// Lightweight meta endpoint used by clients to decide whether to fetch a fragment
statusRoute.get("/meta", async (c) => {
  const current = await getStatusCache(c.env);
  const lastUpdated = current.ts || 0;
  // Avoid relying on cacheMinutes where possible. Prefer an explicitly stored
  // nextGenTs (written by scheduled handler). If not present, prefer a stored
  // cronIntervalMinutes to compute the next timestamp based on the current time.
  const cacheMinutes = current.cacheMinutes ?? projectConfig.cronIntervalMinutes;
  let nextGenTs: number | null = null;
  const now = Date.now();
  if (current.nextGenTs && current.nextGenTs > lastUpdated) {
    nextGenTs = current.nextGenTs;
  } else if (current.cronIntervalMinutes && current.cronIntervalMinutes > 0) {
    // Align from now using cron interval
    const step = current.cronIntervalMinutes;
    const minuteIndex = Math.floor(now / 60000);
    const nextMultiple = Math.floor(minuteIndex / step) * step + step;
    nextGenTs = nextMultiple * 60000;
    if (nextGenTs <= now) nextGenTs += step * 60 * 1000;
  } else if (lastUpdated > 0) {
    // Fallback: compute from lastUpdated using cacheMinutes (least-preferred)
    const minuteIndex = Math.floor(lastUpdated / 60000);
    const nextMultiple =
      Math.floor(minuteIndex / cacheMinutes) * cacheMinutes + cacheMinutes;
    nextGenTs = nextMultiple * 60000;
    if (nextGenTs <= lastUpdated) nextGenTs += cacheMinutes * 60 * 1000;
  }

  // ETag based on lastUpdated and nextGenTs to allow conditional requests
  const etag = `W/"${lastUpdated}-${nextGenTs ?? "null"}"`;
  const ifNoneMatch = c.req.header("if-none-match");

  // Compute TTL (seconds) for s-maxage from nextGenTs (preferred) or
  // from cronIntervalMinutes, falling back to cacheMinutes (which falls back to project config).
  let ttlSeconds = cacheMinutes * 60;
  if (nextGenTs && nextGenTs > now) {
    ttlSeconds = Math.max(1, Math.floor((nextGenTs - now) / 1000));
  } else if (current.cronIntervalMinutes && current.cronIntervalMinutes > 0) {
    ttlSeconds = Math.max(1, current.cronIntervalMinutes * 60);
  }

  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=5`,
    etag,
  } as Record<string, string>;

  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304, headers });
  }

  const body = JSON.stringify({ lastUpdated, nextGenTs });
  return new Response(body, { status: 200, headers });
});

// Return server-rendered fragment (inner app HTML) so clients can replace the UI without full reload
statusRoute.get("/fragment", async (c) => {
  const cache = await getStatusCache(c.env);
  const monitors = cache.monitors || [];
  const lastUpdated = cache.ts || 0;
  // If cache is empty, respond with 503 to indicate not ready
  if (!monitors || lastUpdated === 0) {
    const errHeaders = {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, s-maxage=5, stale-while-revalidate=1",
    };
    return new Response(JSON.stringify({ error: "cache not ready" }), {
      status: 503,
      headers: errHeaders,
    });
  }

  const nextGenTs = cache.nextGenTs ?? null;
  const etag = `W/"${lastUpdated}"`;
  const ifNoneMatch = c.req.header("if-none-match");

  // Compute TTL from nextGenTs (preferred), from cronIntervalMinutes, else cacheMinutes
  const now2 = Date.now();
  let ttlSeconds = (cache.cacheMinutes ?? projectConfig.cronIntervalMinutes) * 60;
  if (nextGenTs && nextGenTs > now2) {
    ttlSeconds = Math.max(1, Math.floor((nextGenTs - now2) / 1000));
  } else if (cache.cronIntervalMinutes && cache.cronIntervalMinutes > 0) {
    ttlSeconds = Math.max(1, cache.cronIntervalMinutes * 60);
  }

  const headers = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=5`,
    etag,
  } as Record<string, string>;

  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304, headers });
  }

  const html = RenderFragment({
    monitors: monitors as any[],
    lastUpdated,
    nextGenTs,
    cacheMinutes: cache.cacheMinutes ?? projectConfig.cronIntervalMinutes,
  });
  return new Response(html, { status: 200, headers });
});

// Dev/debug endpoint: seed cache immediately by running checkStatus() and writing to KV.
// Useful for local development when Cron Triggers aren't populating KV.
statusRoute.get("/seed-cache", async (c) => {
  try {
    const current = await getStatusCache(c.env);
    const monitors = await checkStatus();
    // If a cron interval is already known, compute nextGenTs explicitly so
    // seed-cache stores an aligned timestamp; otherwise leave it for scheduled handler.
    let nextGenTs: number | null = null;
    if (current.cronIntervalMinutes && current.cronIntervalMinutes > 0) {
      const now = Date.now();
      const step = current.cronIntervalMinutes;
      const minuteIndex = Math.floor(now / 60000);
      const nextMultiple = Math.floor(minuteIndex / step) * step + step;
      nextGenTs = nextMultiple * 60000;
      if (nextGenTs <= now) nextGenTs += step * 60 * 1000;
    }
    const cacheMinutes = current.cacheMinutes ?? projectConfig.cronIntervalMinutes;
    await setStatusCache(
      monitors,
      Date.now(),
      cacheMinutes,
      c.env,
      nextGenTs,
      current.cronIntervalMinutes ?? null,
    );
    return c.json({ ok: true, lastUpdated: Date.now() });
  } catch (e) {
    console.error("seed-cache failed", e);
    return c.json({ error: "seed failed" }, 500);
  }
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
