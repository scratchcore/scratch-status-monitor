// Simple status checker that pings configured endpoints and stores results in KV
import type { Monitor } from "./monitors.config";
import monitorsDefault from "./monitors.config";

type Env = Record<string, any>;

let _monitorsCache: Monitor[] | null = null;

async function loadMonitors(env: Env): Promise<Monitor[]> {
  if (_monitorsCache) return _monitorsCache;
  // 1) try to fetch JSON config from static assets (public/pb-assets/monitors.json)
  try {
    const res = await (globalThis as any).fetch("/pb-assets/monitors.json");
    if (res && res.ok) {
      const arr = await res.json();
      if (Array.isArray(arr)) {
        _monitorsCache = arr.map((m: any) => ({ title: m.title || m.url, url: m.url }));
        return _monitorsCache;
      }
    }
  } catch (e) {
    // ignore fetch errors
  }

  // fallback to default TS config bundled with the app
  _monitorsCache = (monitorsDefault || []).map((m: any) => ({ title: m.title || m.url, url: m.url }));
  return _monitorsCache;
}

function resolveKV(env: Env) {
  // Support multiple possible binding names to be flexible in wrangler config
  return env && env.SCRATCH_STATUS_MONITOR;
}

export async function runCheck(env: Env) {
  const kv = resolveKV(env) as any;
  if (!kv) {
    throw new Error(
      "No KV binding found. Expected one of: SCRATCH_STATUS_MONITOR"
    );
  }
  const monitors = await loadMonitors(env);
  const results: Array<Record<string, any>> = [];

  for (const m of monitors) {
    const url = m && (m.url || String(m));
    if (!url) continue;
    const timeoutMs = Number(env && env.STATUS_TIMEOUT_MS) || 5000;
    const start = Date.now();
    let status = 0;
    let ok = false;
    let timedOut = false;
    try {
      // Use globalThis to access AbortController/setTimeout in environments
      const Controller: any = (globalThis as any).AbortController || (globalThis as any).controller;
      const controller = Controller ? new Controller() : undefined;
      const id = controller
        ? (globalThis as any).setTimeout(() => controller.abort(), timeoutMs)
        : undefined;
      try {
        const fetchOpts: any = { method: "GET" };
        if (controller && controller.signal) fetchOpts.signal = controller.signal;
        const res = await (globalThis as any).fetch(url, fetchOpts);
        status = res.status;
        ok = res.ok;
      } finally {
        if (typeof id !== "undefined") (globalThis as any).clearTimeout(id);
      }
    } catch (e: any) {
      // network error or abort
      if (e && (e.name === "AbortError" || e.name === "The user aborted a request.")) {
        timedOut = true;
      }
      status = 0;
      ok = false;
    }
    const latency = Date.now() - start;
    results.push({ url, status, ok, latency, timeout: timedOut, title: m.title || url });
  }

  const record = { timestamp: new Date().toISOString(), results };

  // store latest snapshot
  await kv.put("status:latest", JSON.stringify(record));

  // append to history (keep most recent first) with time-based retention and max entries
  try {
    const raw = await kv.get("status:history");
    let history: Array<any> = [];
    if (raw) {
      try {
        history = JSON.parse(raw);
      } catch {
        history = [];
      }
    }

    // retention settings from env (days) and maximum entries
    const retentionDays =
      Number(env && (env.STATUS_RETENTION_DAYS ?? env.STATUS_RETENTION)) || 7;
    const maxEntries =
      Number(env && (env.STATUS_MAX_HISTORY ?? env.STATUS_HISTORY_MAX)) || 100;

    const cutoff =
      Date.now() - Math.max(0, retentionDays) * 24 * 60 * 60 * 1000;

    // filter out too-old records
    history = history.filter((h) => {
      try {
        const t = new Date(h.timestamp).getTime();
        return !isNaN(t) && t >= cutoff;
      } catch {
        return false;
      }
    });

    // add newest record and cap to maxEntries
    history.unshift(record);
    if (history.length > maxEntries) history = history.slice(0, maxEntries);
    await kv.put("status:history", JSON.stringify(history));
  } catch (e) {
    // ignore history errors
  }

  return record;
}

export async function getLatestStatus(env: Env) {
  const kv = resolveKV(env) as any;
  if (!kv) return null;
  const raw = await kv.get("status:latest");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getHistory(env: Env) {
  const kv = resolveKV(env) as any;
  if (!kv) return [];
  const raw = await kv.get("status:history");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Configuration stored in KV under 'status:config'
export async function getConfig(env: Env) {
  const kv = resolveKV(env) as any;
  if (!kv) return { retentionDays: 7, maxEntries: 100 };
  const raw = await kv.get("status:config");
  if (!raw) return { retentionDays: 7, maxEntries: 100 };
  try {
    const obj = JSON.parse(raw);
    return {
      retentionDays: Number(
        obj.retentionDays ?? obj.STATUS_RETENTION_DAYS ?? 7
      ),
      maxEntries: Number(obj.maxEntries ?? obj.STATUS_MAX_HISTORY ?? 100),
    };
  } catch {
    return { retentionDays: 7, maxEntries: 100 };
  }
}

export async function setConfig(
  env: Env,
  cfg: { retentionDays?: number; maxEntries?: number }
) {
  const kv = resolveKV(env) as any;
  if (!kv) throw new Error("No KV binding");
  const cur = await getConfig(env);
  const next = { ...cur, ...cfg };
  await kv.put("status:config", JSON.stringify(next));
  return next;
}

export async function clearHistory(env: Env) {
  const kv = resolveKV(env) as any;
  if (!kv) throw new Error("No KV binding");
  await kv.put("status:history", JSON.stringify([]));
  await kv.delete("status:latest");
  return true;
}
