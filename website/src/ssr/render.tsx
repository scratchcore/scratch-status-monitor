import { renderToString } from "react-dom/server";
import StatusPage from "./StatusPage";

export function RenderPage({
  monitors,
  lastUpdated,
  nextGenTs,
  cacheMinutes,
}: {
  monitors: any[];
  lastUpdated: number;
  nextGenTs?: number | null;
  cacheMinutes: number;
}) {
  const content = renderToString(
    <StatusPage
      monitors={monitors}
      lastUpdated={lastUpdated}
      nextGenTs={nextGenTs}
      cacheMinutes={cacheMinutes}
    />,
  );

  // JSON-safe payload for client-side React and small client script
  const initialState = { monitors, lastUpdated, nextGenTs, cacheMinutes };
  const initialPayload = JSON.stringify(initialState).replaceAll(
    "</",
    "\\u003c/",
  );

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>Scratch Status Monitor</title>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"/>
      <!-- Google tag (gtag.js) -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y1LF8EML76"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Y1LF8EML76');
      </script>
    </head>
    <body>
      <div id="app">${content}</div>
      <script>window.__INITIAL_DATA__ = ${initialPayload};</script>
      <script>
      (function(){
        const data = window.__INITIAL_DATA__;
        const el = document.getElementById('next-gen-remaining');
        if(!el || !data || !data.nextGenTs) return;
        function update(){
          const now = Date.now();
          const diff = Math.max(0, Math.ceil((data.nextGenTs - now) / 1000));
          el.textContent = diff + 's';
          if(diff <= 0){
            clearInterval(timer);
            try{
              const url = new URL(window.location.href);
              if(url.searchParams.get('force') !== '1'){
                url.searchParams.set('force','1');
                // navigate to force refresh so server regenerates cached data
                window.location.href = url.toString();
              }
            }catch(e){
              // fallback
              window.location.reload();
            }
          }
        }
        update();
        const timer = setInterval(update, 1000);
      })();
      // If page was loaded with ?force=1, remove the param from the visible URL
      (function(){
        try{
          const url = new URL(window.location.href);
          if(url.searchParams.get('force') === '1'){
            url.searchParams.delete('force');
            const clean = url.pathname + (url.search ? ('?' + url.searchParams.toString()) : '');
            history.replaceState(null, '', clean);
          }
        }catch(e){}
      })();
      </script>
    </body>
  </html>`;

  return html;
}
