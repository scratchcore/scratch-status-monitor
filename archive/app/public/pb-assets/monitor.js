// monitor.js (ES module)
// Mount-based renderer: attach service cards to the existing columns rendered by TSX
const charts = new Map();
let cols = [];
let auto = true;
const observers = new Map();

function safeResizeAll() {
  charts.forEach((c) => {
    try {
      c.resize();
    } catch (e) {
      // ignore
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    // debounce slightly to avoid thrash
    if (typeof window._monitorResizeTimeout !== "undefined") clearTimeout(window._monitorResizeTimeout);
    window._monitorResizeTimeout = setTimeout(() => {
      safeResizeAll();
    }, 120);
  });
}

function createGradient(ctx, color) {
  const grad = ctx.createLinearGradient(0, 0, 0, 40);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(14,165,233,0.05)");
  return grad;
}

function ensureCard(container, url) {
  let card = container.querySelector(`[data-url="${url}"]`);
  if (card) return card;

  const div = document.createElement("div");
  div.className = "service";
  div.setAttribute("data-url", url);

  const titleContainer = document.createElement("div");
  titleContainer.className = "title-container";
  div.appendChild(titleContainer);

  const dot = document.createElement("div");
  dot.className = "dot";

  const name = document.createElement("div");
  name.className = "name";
  // leave name blank for now; renderer will fill with title (if available) or url
  name.textContent = "";

  const canvas = document.createElement("canvas");
  canvas.className = "spark";
  // Do not set fixed width/height attributes here; let CSS and Chart.js responsive mode control sizing

  const meta = document.createElement("div");
  meta.className = "meta";

  titleContainer.appendChild(dot);
  titleContainer.appendChild(name);
  div.appendChild(canvas);
  div.appendChild(meta);

  container.appendChild(div);
  return div;
}

function createChart(canvas, lat) {
  const ctx = canvas.getContext("2d");
  const gradient = createGradient(ctx, "rgba(14,165,233,0.8)");
  const labels = new Array(lat.length).fill("");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: lat,
          borderColor: "#0ea5e9",
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: { x: { display: false }, y: { display: false } },
    },
  });
  return chart;
}

function updateOrCreateChart(url, canvas, lat) {
  const existing = charts.get(url);
  if (existing) {
    try {
      existing.data.datasets[0].data = lat;
      existing.update();
      return existing;
    } catch (e) {
      try {
        existing.destroy();
      } catch (e) {}
      charts.delete(url);
    }
  }
  const chart = createChart(canvas, lat);
  charts.set(url, chart);
  return chart;
}

async function fetchStatus() {
  const res = await fetch("/status?history=true");
  return res.json();
}

async function refresh() {
  try {
    const payload = await fetchStatus();
    render(payload);
    // After render, ensure charts recalc their size in case CSS changed
    safeResizeAll();
  } catch (e) {
    console.error(e);
  }
}

function render(payload) {
  const latest = payload.latest || {};
  const history = payload.history || [];
  const cfg = payload.config || { maxEntries: 60 };
  const services = (latest.results || []).map((r) => r.url);
  if (services.length === 0 && history.length > 0) {
    const first = history[0];
    if (first && first.results)
      services.push(...first.results.map((r) => r.url));
  }

  const displayCount = Math.min(Number(cfg.maxEntries || 60), 60);

  services.forEach((url, i) => {
    const col = cols.length ? cols[i % cols.length] : document.body;
    const card = ensureCard(col, url);
    const canvas = card.querySelector("canvas.spark");
    const dot = card.querySelector(".dot");
    const meta = card.querySelector(".meta");

    // build latency array from history
    const recent = history.slice(0, displayCount);
    const lat = new Array(displayCount).fill(0);
    for (let j = 0; j < recent.length; j++) {
      const h = recent[j];
      const item = (h.results || []).find((r) => r.url === url);
      const v = item ? (item.ok ? item.latency : 0) : 0;
      lat[displayCount - 1 - j] = v;
    }

    const latestItem = (latest.results || []).find((r) => r.url === url) || {};
    const ok = latestItem.ok === true;
    // color: green = ok, yellow = timeout, red = down/error
    if (dot) {
      if (latestItem && latestItem.timeout) {
        dot.style.background = "#f59e0b"; // amber/yellow for timeout
      } else {
        dot.style.background = ok ? "#16a34a" : "#ef4444";
      }
    }
    if (meta) {
      const statusLabel = latestItem.timeout ? "TIMEOUT" : (latestItem.status || "--");
      const okLabel = latestItem.timeout ? "TIMEOUT" : (latestItem.ok ? "OK" : "ERR");
      const latencyLabel = latestItem.timeout ? "-" : (latestItem.latency != null ? latestItem.latency + " ms" : "0 ms");
      meta.innerHTML = `<div>${statusLabel} ${okLabel}</div><div class="small">${latencyLabel}</div>`;
    }

    // set human friendly name if title provided
    const nameEl = card.querySelector(".name");
    if (nameEl) nameEl.textContent = latestItem.title || url;

    // update/create chart
    if (canvas) updateOrCreateChart(url, canvas, lat);
  });
}

export function mountAll() {
  cols = Array.from(document.querySelectorAll(".monitor-column"));

  const btn = document.getElementById("btn-check");
  if (btn) {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await fetch("/check", { method: "GET" });
      } catch (e) {
        console.error(e);
      }
      btn.disabled = false;
      await refresh();
    });
  }

  // initial load and interval
  refresh();
  setInterval(() => {
    if (auto) refresh();
  }, 10000);
}

// auto-mount when module loads
mountAll();
