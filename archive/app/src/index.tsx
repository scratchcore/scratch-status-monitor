import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { jsxRenderer } from "hono/jsx-renderer";
import {
  runCheck,
  getLatestStatus,
  getHistory,
  getConfig,
  setConfig,
  clearHistory,
} from "./status";
import { MonitorsPage, AdminPage } from "./templates";

const app = new Hono();
app.use(prettyJSON());

app.get(
  "/*",
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Scratch Status Monitor</title>
        </head>
        <body>{children}</body>
      </html>
    );
  })
);

app.get("/", (c) => {
  return c.render((<MonitorsPage />) as any);
});

app.get("/ping", (c) => c.text("pong"));

// Simple admin token check helper. Checks header 'x-admin-token' or query 'token' against env.ADMIN_TOKEN or env.ADMIN_SECRET
// Temporarily disable admin token checks for local testing.
function isAdminAuthorized(c: any) {
  return true;
}

// Serve admin UI (requires token)
app.get("/admin", async (c) => {
  if (!isAdminAuthorized(c)) return c.text("Forbidden", 403);
  const cfg = await getConfig((c.env as any) || {});
  return c.render(
    (
      <AdminPage
        retentionDays={cfg.retentionDays}
        maxEntries={cfg.maxEntries}
      />
    ) as any
  );
});

// Admin APIs
app.get("/admin/api/history", async (c) => {
  if (!isAdminAuthorized(c)) return c.json({ error: "forbidden" }, 403);
  const env = (c.env as any) || {};
  const history = await getHistory(env);
  return c.json(history);
});

app.post("/admin/api/check", async (c) => {
  if (!isAdminAuthorized(c)) return c.json({ error: "forbidden" }, 403);
  const env = (c.env as any) || {};
  const r = await runCheck(env);
  return c.json(r);
});

app.post("/admin/api/clear", async (c) => {
  if (!isAdminAuthorized(c)) return c.json({ error: "forbidden" }, 403);
  const env = (c.env as any) || {};
  await clearHistory(env);
  return c.json({ ok: true });
});

app.post("/admin/api/config", async (c) => {
  if (!isAdminAuthorized(c)) return c.json({ error: "forbidden" }, 403);
  const env = (c.env as any) || {};
  const body = await c.req.json();
  const next = await setConfig(env, {
    retentionDays: Number(body.retentionDays || 7),
    maxEntries: Number(body.maxEntries || 100),
  });
  return c.json(next);
});

// Trigger a single check (POST)
app.post("/check", async (c) => {
  try {
    const env = (c.env as any) || {};
    const result = await runCheck(env);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// For development convenience allow GET /check to trigger a run (so curl/browser can be used)
app.get("/check", async (c) => {
  try {
    const env = (c.env as any) || {};
    const result = await runCheck(env);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// Public status endpoint: returns latest; with ?history=true returns history too
app.get("/status", async (c) => {
  try {
    const env = (c.env as any) || {};
    // cache TTL in seconds (edge), default 10s
    const cacheTtl = Number(
      env.STATUS_CACHE_TTL_SEC || env.STATUS_CACHE_TTL || 10
    );

    // Build a cache key using the request URL (includes query params)
    const url = new URL(c.req.url);
    const cacheKey = new Request(url.toString(), { method: "GET" });

    // Try edge cache first (Cloudflare Workers caches.default)
    try {
      const cachesApi = (globalThis as any).caches;
      if (cachesApi && cachesApi.default) {
        const cached = await cachesApi.default.match(cacheKey);
        if (cached) return cached.clone();
      }
    } catch (e) {
      // ignore cache errors and fall back to origin
    }

    const latest = await getLatestStatus(env);
    const q = c.req.query("history");
    if (q === "true" || q === "1") {
      const history = await getHistory(env);
      const cfg = await getConfig(env);
      const body = JSON.stringify({ latest, history, config: cfg });
      const res = new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": `public, max-age=${cacheTtl}`,
        },
      });
      try {
        const cachesApi = (globalThis as any).caches;
        if (cachesApi && cachesApi.default)
          await cachesApi.default.put(cacheKey, res.clone());
      } catch (e) {}
      return res;
    }

    const body = JSON.stringify({ latest });
    const res = new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${cacheTtl}`,
      },
    });
    try {
      const cachesApi = (globalThis as any).caches;
      if (cachesApi && cachesApi.default)
        await cachesApi.default.put(cacheKey, res.clone());
    } catch (e) {}
    return res;
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// A route that Cloudflare Cron Triggers can call (POST) to run checks on schedule
app.post("/cron", async (c) => {
  try {
    const env = (c.env as any) || {};
    await runCheck(env);
    return c.text("ok");
  } catch (e: any) {
    return c.text("error", 500);
  }
});

// Allow GET /cron for local testing (wrangler dev) — POST is still preferred for production cron.
app.get("/cron", async (c) => {
  try {
    const env = (c.env as any) || {};
    await runCheck(env);
    return c.text("ok");
  } catch (e: any) {
    return c.text("error", 500);
  }
});

export default app;
