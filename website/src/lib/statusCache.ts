import { projectConfig } from "~/project.config";

export type StatusCache = {
  ts: number;
  monitors: any[] | null;
  cacheMinutes: number;
  nextGenTs?: number | null;
  // Detected Cloudflare Cron trigger interval in minutes (saved once when detected)
  cronIntervalMinutes?: number | null;
};

// In-memory fallback cache for local dev
let memoryCache: StatusCache = {
  ts: 0,
  monitors: null,
  cacheMinutes: projectConfig.cronIntervalMinutes,
  nextGenTs: null,
  cronIntervalMinutes: null,
};

const KV_KEY = "status:cache";

// Read cache from Workers KV if `env` provided and binding exists, otherwise from memory
export async function getStatusCache(env?: any): Promise<StatusCache> {
  if (
    env &&
    env.SCRATCH_STATUS_MONITOR &&
    typeof env.SCRATCH_STATUS_MONITOR.get === "function"
  ) {
    try {
      const v = await env.SCRATCH_STATUS_MONITOR.get(KV_KEY, { type: "json" });
      if (v && typeof v === "object") {
        return v as StatusCache;
      }
    } catch (e) {
      console.error("statusCache: KV get failed", e);
    }
  }
  return memoryCache;
}

// Write cache to KV if env provided, otherwise to memory
export async function setStatusCache(
  monitors: any[] | null,
  ts: number,
  cacheMinutes = projectConfig.cronIntervalMinutes,
  env?: any,
  nextGenTs?: number | null,
  cronIntervalMinutes?: number | null,
) {
  // Compute nextGenTs if not provided
  let computedNextGenTs: number | null = nextGenTs ?? null;
  if (computedNextGenTs == null) {
    // Choose interval for alignment: prefer detected cron interval when available,
    // otherwise fall back to provided cacheMinutes.
    const stepMinutes = cronIntervalMinutes ?? cacheMinutes;
    const minuteIndex = Math.floor(ts / 60000);
    const nextMultiple =
      Math.floor(minuteIndex / stepMinutes) * stepMinutes + stepMinutes;
    computedNextGenTs = nextMultiple * 60000;
    if (computedNextGenTs <= ts) computedNextGenTs += stepMinutes * 60 * 1000;
    // ensure it's in the future relative to now
    const now = Date.now();
    const step = stepMinutes * 60 * 1000;
    while (computedNextGenTs <= now) computedNextGenTs += step;
  }

  const value: StatusCache = {
    ts,
    monitors,
    cacheMinutes,
    nextGenTs: computedNextGenTs,
    cronIntervalMinutes: cronIntervalMinutes ?? null,
  };
  if (
    env &&
    env.SCRATCH_STATUS_MONITOR &&
    typeof env.SCRATCH_STATUS_MONITOR.put === "function"
  ) {
    try {
      await env.SCRATCH_STATUS_MONITOR.put(KV_KEY, JSON.stringify(value));
      return;
    } catch (e) {
      console.error("statusCache: KV put failed", e);
    }
  }
  memoryCache = value;
}

export async function clearStatusCache(env?: any) {
  memoryCache = { ts: 0, monitors: null, cacheMinutes: projectConfig.cronIntervalMinutes, nextGenTs: null };
  if (
    env &&
    env.SCRATCH_STATUS_MONITOR &&
    typeof env.SCRATCH_STATUS_MONITOR.delete === "function"
  ) {
    try {
      await env.SCRATCH_STATUS_MONITOR.delete(KV_KEY);
    } catch (e) {
      console.error("statusCache: KV delete failed", e);
    }
  }
}
