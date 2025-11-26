(function () {
  // Lightweight client-side partial updater.
  // - Polls /v1/api/status/meta around nextGenTs and fetches /v1/api/status/fragment when updated.
  // - Keeps network impact minimal by only fetching meta until it changes.

  const app = document.getElementById("app");
  if (!app) return;

  let lastUpdated = Number(app.dataset.lastUpdated || 0);
  const cacheMinutes = Number(app.dataset.cacheMinutes || 3);
  let nextGenTs = Number(app.dataset.nextGenTs || 0) || null;

  const metaUrl = "/v1/api/status/meta";
  const fragUrl = "/v1/api/status/fragment";

  async function checkMeta() {
    try {
      const res = await fetch(metaUrl, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("meta fetch failed", e);
      return null;
    }
  }

  async function fetchFragmentAndReplace(newTs) {
    try {
      const res = await fetch(fragUrl, { cache: "no-store" });
      if (!res.ok) return;
      const html = await res.text();
      app.innerHTML = html;
      lastUpdated = Number(newTs || Date.now());
      app.dataset.lastUpdated = String(lastUpdated);
      // update nextGenTs from meta after replacing
      const meta = await checkMeta();
      if (meta && meta.nextGenTs) {
        startCountdown(Number(meta.nextGenTs));
      }
    } catch (e) {
      console.error("fragment fetch failed", e);
    }
  }

  let countdownTimer = null;
  function startCountdown(ts) {
    if (!ts) return;
    // if ts is not in the future, avoid immediate tight loop by deferring a meta check
    const now = Date.now();
    if (ts <= now + 500) {
      // small debounce: re-check meta after a short delay to give server time to update cache
      // increase from 1s to reduce tight loops when timings slightly misalign.
      setTimeout(() => checkMetaAndMaybeFetch(), 5000);
      return;
    }
    nextGenTs = ts;
    if (countdownTimer) clearInterval(countdownTimer);
    function tick() {
      const el = document.getElementById("next-gen-remaining");
      if (el) {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((nextGenTs - now) / 1000));
        el.textContent = diff + "s";
        if (diff <= 0) {
          clearInterval(countdownTimer);
          // nextGen arrived; check meta and possibly fetch fragment
          checkMeta().then((m) => {
            if (m && Number(m.lastUpdated) > lastUpdated) {
              fetchFragmentAndReplace(m.lastUpdated);
            } else if (m && m.nextGenTs) {
              // no change yet, continue countdown to the new nextGenTs
              startCountdown(Number(m.nextGenTs));
            } else {
              // fallback: poll after a longer delay to reduce meta traffic
              setTimeout(() => checkMetaAndMaybeFetch(), 15_000);
            }
          });
        }
      }
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  async function checkMetaAndMaybeFetch() {
    const meta = await checkMeta();
    if (!meta) return;
    if (meta.refreshing) {
      // server is regenerating; poll again shortly
      setTimeout(() => checkMetaAndMaybeFetch(), 1000);
      return;
    }
    if (Number(meta.lastUpdated) > lastUpdated) {
      await fetchFragmentAndReplace(meta.lastUpdated);
    } else if (meta.nextGenTs) {
      startCountdown(Number(meta.nextGenTs));
    }
  }

  // Initialize: if there is a server-provided nextGenTs, start countdown; otherwise do a light poll.
  if (nextGenTs) {
    startCountdown(nextGenTs);
  } else {
    // Poll meta infrequently as fallback. Increase base intervals to reduce requests.
    // Initial delay: max(30s, cacheMinutes*30s). Regular interval: max(60s, cacheMinutes*60s).
    setTimeout(checkMetaAndMaybeFetch, Math.max(30_000, cacheMinutes * 30_000));
    setInterval(
      checkMetaAndMaybeFetch,
      Math.max(60_000, cacheMinutes * 60_000),
    );
  }
})();
