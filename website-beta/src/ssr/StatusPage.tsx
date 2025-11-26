import { MonitorConfig } from "~/motitors";
import { MonitorCategory } from "../types/motior";

export default function StatusPage({
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
  function escapeHtml(s: any) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  return (
    <div className="w-full overflow-x-clip">
      <div className="bg-orange-400 flex justify-center items-center w-full h-[300px] mb-14">
        <h1 className="text-white text-center font-bold text-4xl sm:text-5xl md:text-6xl">
          Scratch Status Monitor
        </h1>
      </div>
      <div className="w-[90%] max-w-4xl mx-auto">
        <div className="w-full">
          {MonitorConfig.category.map((c: MonitorCategory) => (
            <div key={c.id} className="mb-3">
              <h2 className="uppercase mb-2">{c.label}</h2>
              <div className="grid *:first:rounded-t-md *:last:rounded-b-md">
                {monitors
                  .filter((r: any) => r.category === c.id)
                  .map((r: any) => {
                    const info = r.timeout ? "timeout" : (r.error?.type ?? "");
                    const errMsg = r.error?.message
                      ? ` — ${r.error.message}`
                      : "";
                    const statusLabel = r.ok ? "Operational" : "Partial Outage";
                    const color = r.ok
                      ? "online"
                      : r.timeout
                        ? "degraded"
                        : "offline";
                    return (
                      <div
                        key={r.id}
                        className={`w-full p-3 border-neutral-300 border border-t-0 first:border-t`}
                      >
                        <div className="w-full">
                          <div className="float-left font-semibold truncate max-w-1/2">
                            {escapeHtml(r.title ?? r.id)}
                          </div>
                          <div
                            className={`float-right border-neutral-300 flex justify-center items-center gap-2 px-2 py-0.5 border rounded-full group ${color}`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 group-[.online]:bg-emerald-500 group-[.offline]:bg-red-500 group-[.maintenance]:bg-blue-500 group-[.degraded]:bg-amber-500" />
                              <span className="relative inline-flex h-2 w-2 rounded-full group-[.online]:bg-emerald-500 group-[.offline]:bg-red-500 group-[.maintenance]:bg-blue-500 group-[.degraded]:bg-amber-500" />
                            </span>
                            <span className="text-sm">
                              {escapeHtml(statusLabel)}
                            </span>
                          </div>
                        </div>
                        {/* <div className="truncate">{escapeHtml(r.url)}</div> */}
                        <div className="flex flex-wrap gap-2 w-full pt-2">
                          <div
                            className={`border-neutral-300 flex justify-center items-center gap-2 w-fit px-2 py-0.5 border rounded-full group ${color}`}
                          >
                            <span className="text-sm">latency</span>
                            <span className="text-sm">{r.latency}ms</span>
                          </div>
                          <div
                            className={`border-neutral-300 flex justify-center items-center gap-2 w-fit px-2 py-0.5 border rounded-full group ${color}`}
                          >
                            <span className="text-sm">status</span>
                            <span className="text-sm">
                              {r.statusCode ? ` ${r.statusCode}` : "-"}
                            </span>
                          </div>
                        </div>
                        {/* <div className="info">
                    {escapeHtml(info)}
                    {escapeHtml(errMsg)}
                  </div> */}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-neutral-500 text-sm w-full pb-3 mx-auto my-8 border-neutral-300 border-b">
          <div className="">
            Server snapshot — last updated:{" "}
            {new Date(lastUpdated).toLocaleString()}
          </div>
        </div>

        <div className="mt-17">
          <h2 className="leading-9 uppercase">Past Incidents - coming soon</h2>
          {Array.from({ length: 1 }).map((_, i) => {
            const date = new Date();

            return (
              <div key={i} className="mt-5">
                <div className="text-xl font-medium pb-[3px] mb-2.5 border-neutral-300 border-b">
                  {date.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="text-neutral-500">No incidents reported today.</p>
              </div>
            );
          })}
        </div>

        <div className="mt-17">
          <script
            src="https://giscus.app/client.js"
            data-repo="scratchcore/scratch-status-monitor"
            data-repo-id="R_kgDOPZOm6A"
            data-mapping="number"
            data-term="1"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="light"
            data-lang="en"
            data-loading="lazy"
            async
          />
        </div>

        {/* Show next generation time and remaining seconds. JS will update remaining client-side. */}
        <div className="text-neutral-500 text-sm w-full pt-3 mx-auto my-18 border-neutral-300 border-t">
          <div className="float-left">
            Next scheduled generation:{" "}
            {nextGenTs ? new Date(nextGenTs).toLocaleString() : "N/A"}
            {nextGenTs ? (
              <span>
                {" "}
                (
                <span id="next-gen-remaining">
                  {Math.max(0, Math.ceil((nextGenTs - Date.now()) / 1000))}s
                </span>
                )
              </span>
            ) : null}{" "}
            — Cache TTL: {cacheMinutes}m
          </div>
          <div className="float-right">
            <span className="mr-1">Created by</span>
            <a
              href="https://github.com/toakiryu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 active:scale-95"
            >
              Toa Kiryu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
