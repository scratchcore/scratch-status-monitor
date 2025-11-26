import type { FC } from "hono/jsx";

export const MonitorsPage: FC = () => {
  return (
    <>
      <h1>Scratch Status Monitor</h1>
      <div class="controls">
        <button id="btn-check">手動チェック</button>
        <span class="small">
          自動更新: <span id="auto">有効</span>（10秒）
        </span>
      </div>
      <div id="list" class="monitor-grid">
        <div class="monitor-column" data-col="0"></div>
        <div class="monitor-column" data-col="1"></div>
        <div class="monitor-column" data-col="2"></div>
      </div>
      <link rel="stylesheet" href="/pb-assets/monitor.css" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script type="module" src="/pb-assets/monitor.js"></script>
    </>
  );
};

export const AdminPage: FC<{ retentionDays: number; maxEntries: number }> = (
  props
) => {
  const { retentionDays = 7, maxEntries = 100 } = props || {};
  const script = `
    async function fetchJSON(path, opts) {
      opts = opts || {};
      opts.headers = opts.headers || {};
      opts.headers['x-admin-token'] = '';
      const r = await fetch(path, opts);
      return r.json();
    }
    document.getElementById('btn-check').addEventListener('click', async () => {
      await fetchJSON('/admin/api/check', { method: 'POST' });
      await loadHistory();
    });
    document.getElementById('btn-clear').addEventListener('click', async () => {
      await fetchJSON('/admin/api/clear', { method: 'POST' });
      await loadHistory();
    });
    document.getElementById('btn-save').addEventListener('click', async () => {
      await fetchJSON('/admin/api/config', {
        method: 'POST',
        body: JSON.stringify({
          retentionDays: Number(document.getElementById('retention').value),
          maxEntries: Number(document.getElementById('max').value),
        }),
      });
      alert('saved');
    });
    async function loadHistory() {
      const d = await fetchJSON('/admin/api/history');
      document.getElementById('history').textContent = JSON.stringify(d, null, 2);
    }
    loadHistory();
  `.trim();

  return (
    <>
      <h1>Admin</h1>
      <div>
        <button id="btn-check" class="btn">
          手動チェック実行
        </button>
        <button id="btn-clear" class="btn">
          履歴クリア
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          保持日数:
          <input id="retention" type="number" defaultValue={retentionDays} />
        </label>
        <label style={{ marginLeft: 8 }}>
          最大件数:
          <input id="max" type="number" defaultValue={maxEntries} />
        </label>
        <button id="btn-save" class="btn">
          保存
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <h2>履歴</h2>
        <pre id="history">読み込み中…</pre>
      </div>
      <style>{`body { font-family: system-ui; padding: 18px; background: #f8fafc; } h1 { margin: 0 0 12px; } .btn { padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }`}</style>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
};
