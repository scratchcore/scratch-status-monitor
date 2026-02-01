/**
 * @scratchcore/scracsm-types
 * バックエンド・フロントエンド間で共有する型定義
 */

// Serialization helpers
export type { Serialized, SerializedInfer } from "./serialized.js";

// Status関連
export {
  StatusLevel,
  MonitorStatus,
  CategoryStatus,
  StatusResponse,
  StatusCheckResult,
  type StatusLevel as StatusLevelType,
  type MonitorStatus as MonitorStatusType,
  type CategoryStatus as CategoryStatusType,
  type StatusResponse as StatusResponseType,
  type StatusCheckResult as StatusCheckResultType,
} from "./status.js";

// History関連
export {
  HistoryRecord,
  MonitorHistory,
  HistoryResponse,
  HistoryStats,
  type HistoryRecord as HistoryRecordType,
  type MonitorHistory as MonitorHistoryType,
  type HistoryResponse as HistoryResponseType,
  type HistoryStats as HistoryStatsType,
} from "./history.js";

// Error関連
export {
  ErrorCodeEnum,
  ErrorResponse,
  SuccessResponse,
  APIResponse,
  createErrorResponse,
  createSuccessResponse,
  ERROR_MESSAGES,
  type ErrorCode,
  type ErrorResponse as ErrorResponseType,
  type SuccessResponse as SuccessResponseType,
  type APIResponse as APIResponseType,
} from "./error.js";

// Monitor関連
export type { Monitor, MonitorConfig } from "./monitor.js";

// API Metadata関連
export type { ApiMetadata } from "./api-metadata.js";
