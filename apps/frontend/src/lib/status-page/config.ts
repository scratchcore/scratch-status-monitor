import { getEnv } from "@/plugins/envrc";

export const CACHE_KEY = "status-page-cache";
export const STATUS_PAGE_QUERY_KEY = ["status-page", "status-history"];

export const getBackendBaseUrl = (): string => {
	const env = getEnv({ throwOnError: true });
	return env.VITE_BACKEND_URL;
};
