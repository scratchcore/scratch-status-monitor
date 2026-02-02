import { getEnv } from "@/plugins/envrc";

export const CACHE_KEY = "status-page-cache";
export const STATUS_PAGE_QUERY_KEY = ["status-page", "status-history"];

export const getBackendBaseUrl = (): string => {
	const env = getEnv({ throwOnError: false });
	if (!env || !("VITE_BACKEND_URL" in env)) {
		return "http://127.0.0.1:8787";
	}
	return env.VITE_BACKEND_URL as string;
};
