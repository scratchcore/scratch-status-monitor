async function tick() {
  try {
    const r = await fetch('http://127.0.0.1:8787/cron', { method: 'GET' });
    console.log(new Date().toISOString(), r.status);
  } catch (e) {
    console.error(new Date().toISOString(), 'error', e.message);
  }
}

setInterval(tick, 10_000); // 10秒
tick();