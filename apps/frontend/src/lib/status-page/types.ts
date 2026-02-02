import type {
  HistoryResponse as HistoryResponseSchema,
  SerializedInfer,
  StatusResponse as StatusResponseSchema,
} from "@scratchcore/ssm-types";

// シリアライズされた型（Date -> string）
export type StatusResponse = SerializedInfer<typeof StatusResponseSchema> & {
  expiresAt: string;
};
export type HistoryResponse = SerializedInfer<typeof HistoryResponseSchema>;

export type StatusApiEnvelope = {
  success: boolean;
  data: StatusResponse;
  message?: string;
};

export type HistoryApiEnvelope = {
  success: boolean;
  data: HistoryResponse[];
  message?: string;
};

export type StatusPageLoaderData = {
  status: StatusResponse;
  histories: HistoryResponse[];
};
