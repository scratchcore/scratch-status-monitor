import { Hono } from "hono";
import { RenderPage } from "../ssr/render";
import { checkStatus } from "./v1/api/status";
import { createBadRequestError } from "../schemas/BadRequestError";

export const RootPage = new Hono();

let cached: { ts: number; data: any[] | null } = { ts: 0, data: null };
// Cache duration in minutes
let cacheMinutes = 1;

// Root: server-rendered page using React SSR helper
RootPage.get("/", async (c) => {
  const force = c.req.query("refresh") === "1" || c.req.query("force") === "1";
  const now = Date.now();

  const age = cached.ts ? Math.floor((now - cached.ts) / 1000) : 0;
  let results: any[] = [];
  let nextGenTs: number | null = null;

  // Simple caching: treat cacheMinutes as the TTL in minutes.
  if (!force && cached.data) {
    if (age <= cacheMinutes * 60) {
      results = cached.data as any[];
    } else {
      results = await checkStatus();
      cached = { ts: Date.now(), data: results };
    }
  } else {
    results = await checkStatus();
    cached = { ts: Date.now(), data: results };
  }

  // next generation timestamp = last cached timestamp + TTL (in ms)
  if (cached.ts > 0) {
    // Align nextGenTs to the next minute boundary that is a multiple of cacheMinutes.
    // Example: cacheMinutes=1 -> next minute (12:01:00). cacheMinutes=2 -> next even 2-minute boundary (12:02:00, 12:04:00, ...).
    const minuteIndex = Math.floor(cached.ts / 60000); // minutes since epoch
    const nextMultiple =
      Math.floor(minuteIndex / cacheMinutes) * cacheMinutes + cacheMinutes;
    nextGenTs = nextMultiple * 60000;
    // Ensure nextGenTs is strictly in the future relative to cached.ts
    if (nextGenTs <= cached.ts) {
      nextGenTs += cacheMinutes * 60 * 1000;
    }
  }

  const html = RenderPage({
    monitors: results,
    lastUpdated: cached.ts,
    nextGenTs,
    cacheMinutes,
  });
  return c.html(html);
});