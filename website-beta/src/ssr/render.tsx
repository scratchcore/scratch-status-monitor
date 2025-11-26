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

  // (RenderFragment exported below)

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
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
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
      <div id="app" data-last-updated="${lastUpdated}" data-next-gen-ts="${nextGenTs ?? ''}" data-cache-minutes="${cacheMinutes}">${content}</div>
      <script>window.__INITIAL_DATA__ = ${initialPayload};</script>
      <script src="/scripts/partial-update.js" defer></script>
      <script>
      // No client-side "force" handling — server auto-refreshes in background.
      </script>
    </body>
  </html>`;

  return html;
}

export function RenderFragment({
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
  return renderToString(
    <StatusPage monitors={monitors} lastUpdated={lastUpdated} nextGenTs={nextGenTs} cacheMinutes={cacheMinutes} />,
  );
}
