import { Hono } from "hono";
import { RenderPage } from "../ssr/render";
import { getStatusCache } from "~/src/lib/statusCache";
import { projectConfig } from "~/project.config";

export const RootPage = new Hono();

// Cache duration in minutes — prefer configured cron interval then fallback to 5
let cacheMinutes = projectConfig.cronIntervalMinutes;

// Root: server-rendered page using React SSR helper
RootPage.get("/", async (c) => {
  const cached = await getStatusCache(c.env);
  let results: any[] = [];
  let nextGenTs: number | null = null;

  // Use server-side cache if available. Cron Triggers refresh the cache.
  if (cached.monitors) {
    results = cached.monitors as any[];
  } else {
    // Cache not yet populated by Cron; render an empty state.
    results = [];
  }

  // next generation timestamp = last cached timestamp + TTL (in ms)
  const updatedCache = await getStatusCache(c.env);
  // prefer an explicitly stored nextGenTs first (scheduled handler writes it),
  // then prefer detected cronIntervalMinutes or cacheMinutes for alignment.
  cacheMinutes =
    updatedCache.cronIntervalMinutes ??
    updatedCache.cacheMinutes ??
    cacheMinutes;
  if (updatedCache.nextGenTs && updatedCache.nextGenTs > updatedCache.ts) {
    nextGenTs = updatedCache.nextGenTs;
  } else if (updatedCache.ts > 0) {
    // Align nextGenTs to the next minute boundary that is a multiple of cacheMinutes.
    // Example: cacheMinutes=1 -> next minute (12:01:00). cacheMinutes=2 -> next even 2-minute boundary (12:02:00, 12:04:00, ...).
    const minuteIndex = Math.floor(updatedCache.ts / 60000); // minutes since epoch
    const nextMultiple =
      Math.floor(minuteIndex / cacheMinutes) * cacheMinutes + cacheMinutes;
    nextGenTs = nextMultiple * 60000;
    // Ensure nextGenTs is strictly in the future relative to cached.ts
    if (nextGenTs <= updatedCache.ts) {
      nextGenTs += cacheMinutes * 60 * 1000;
    }
  }

  const html = RenderPage({
    monitors: results,
    lastUpdated: updatedCache.ts,
    nextGenTs,
    cacheMinutes,
  });
  return c.html(html);
});
