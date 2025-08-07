import type { ContentfulStatusCode } from "hono/utils/http-status";

export type APIResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      status: ContentfulStatusCode;
      message: string;
      error?: unknown;
    };
