import { ssmrc } from "@scratchcore/ssm-configs";
import type {
  HistoryResponse as HistoryResponseType,
  StatusResponse as StatusResponseType,
} from "@scratchcore/ssm-types";

export const CACHE_NAMESPACE = "ssm-api";
const CACHE_TTL_SECONDS = Math.floor(ssmrc.cache.statusTtlMs / 1000);

export const buildCacheKey = (url: string) => new Request(url, { method: "GET" });

export const applyCacheHeaders = (response: Response) => {
  response.headers.set(
    "Cache-Control",
    `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS}`,
  );
};

export async function upsertStatusCdnCache(
  baseUrl: string,
  status: StatusResponseType,
): Promise<void> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const url = `${normalizedBaseUrl}/status`;

  const response = new Response(
    JSON.stringify({
      success: true,
      data: status,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );

  applyCacheHeaders(response);

  const cache = await caches.open(CACHE_NAMESPACE);
  await cache.put(buildCacheKey(url), response);
}

export async function upsertHistoryCdnCache(
  baseUrl: string,
  histories: HistoryResponseType[],
  limit: number = 100,
  offset: number = 0,
): Promise<void> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const url = `${normalizedBaseUrl}/history?limit=${limit}&offset=${offset}`;

  const response = new Response(
    JSON.stringify({
      success: true,
      data: histories,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );

  applyCacheHeaders(response);

  const cache = await caches.open(CACHE_NAMESPACE);
  await cache.put(buildCacheKey(url), response);
}
