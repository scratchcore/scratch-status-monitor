export const CACHE_KEY = "status-page-cache";
export const STATUS_PAGE_QUERY_KEY = ["status-page", "status-history"];

export const getBackendBaseUrl = (): string => {
  const fromVite = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const fromNode =
    typeof process !== "undefined"
      ? (process.env.VITE_BACKEND_URL as string | undefined)
      : undefined;
  return fromVite || fromNode || "http://127.0.0.1:8787";
};
