import type { ZodSchema } from "zod";
import { z } from "zod";
import { API_ENDPOINTS, convertPathToOpenAPI } from "../types/api-metadata";

type OpenAPISchema = Record<string, unknown>;
type ZodStringDef = { checks?: Array<{ kind: string }> };
type ZodNumberDef = { checks?: Array<{ kind: string }> };
type ZodObjectDef = { shape: Record<string, ZodSchema> };

function getDef(schema: ZodSchema): { description?: string } {
  const def = schema.def;
  return {
    description:
      def && typeof def === "object" && "description" in def
        ? (def.description as string | undefined)
        : undefined,
  };
}

/**
 * Zod String スキーマを処理
 */
function handleZodString(def: ZodStringDef): OpenAPISchema {
  const result: OpenAPISchema = { type: "string" };
  if (def.checks) {
    for (const check of def.checks) {
      if (check.kind === "email") result.format = "email";
      else if (check.kind === "uuid") result.format = "uuid";
      else if (check.kind === "url") result.format = "uri";
    }
  }
  return result;
}

/**
 * Zod Object スキーマを処理
 */
function handleZodObject(def: ZodObjectDef): OpenAPISchema {
  const properties: Record<string, OpenAPISchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(def.shape)) {
    const valueSchema = value as ZodSchema;
    properties[key] = zodToOpenAPISchema(valueSchema);
    if (!(valueSchema instanceof z.ZodOptional)) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

/**
 * Zod スキーマを OpenAPI スキーマに変換
 */
export function zodToOpenAPISchema(schema: ZodSchema | undefined): OpenAPISchema {
  if (!schema || !schema.def) {
    return { type: "string" };
  }

  const description = getDef(schema).description;
  const baseSchema: OpenAPISchema = description ? { description } : {};

  if (schema instanceof z.ZodString) {
    return { ...handleZodString(schema.def as ZodStringDef), ...baseSchema };
  }

  if (schema instanceof z.ZodNumber) {
    const def = schema.def as ZodNumberDef;
    return {
      type: def.checks?.some((check) => check.kind === "int") ? "integer" : "number",
      ...baseSchema,
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean", ...baseSchema };
  }

  if (schema instanceof z.ZodDate) {
    return { type: "string", format: "date-time", ...baseSchema };
  }

  if (schema instanceof z.ZodEnum) {
    const def = schema._def as unknown as { values: string[] };
    return { type: "string", enum: def.values, ...baseSchema };
  }

  if (schema instanceof z.ZodObject) {
    return { ...handleZodObject(schema.def as ZodObjectDef), ...baseSchema };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToOpenAPISchema(schema._def.type as unknown as ZodSchema),
      ...baseSchema,
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToOpenAPISchema(schema._def.innerType as unknown as ZodSchema);
  }

  if (schema instanceof z.ZodUnion) {
    const def = schema._def as unknown as { options: readonly ZodSchema[] };
    return {
      oneOf: def.options.map((opt: ZodSchema) => zodToOpenAPISchema(opt)),
      ...baseSchema,
    };
  }

  return { type: "string" };
}

/**
 * OpenAPI スキーマドキュメント生成（完全自動化版）
 * routes/api.ts で registerEndpoint() で登録されたメタデータから自動生成
 */
export function generateOpenAPISchema() {
  // タグの集約
  const tagsSet = new Set<string>();
  const tagDescriptions: Record<string, string> = {
    Status: "ステータス関連エンドポイント",
    History: "履歴取得関連エンドポイント",
    Monitors: "モニター情報関連エンドポイント",
  };

  API_ENDPOINTS.forEach((endpoint) => {
    endpoint.tags.forEach((tag) => {
      tagsSet.add(tag);
    });
  });

  const tags = Array.from(tagsSet).map((name) => ({
    name,
    description: tagDescriptions[name as keyof typeof tagDescriptions] || name,
  }));

  // パスの構築
  const paths: Record<string, Record<string, unknown>> = {};

  API_ENDPOINTS.forEach((endpoint) => {
    const openAPIPath = convertPathToOpenAPI(endpoint.path);

    if (!paths[openAPIPath]) {
      paths[openAPIPath] = {};
    }

    // パラメータの構築
    const parameters: Array<Record<string, unknown>> = [];

    // Path パラメータ
    if (endpoint.parameters?.path) {
      Object.entries(endpoint.parameters.path).forEach(([name, schema]) => {
        parameters.push({
          name,
          in: "path",
          required: true,
          schema: zodToOpenAPISchema(schema),
        });
      });
    }

    // Query パラメータ
    if (endpoint.parameters?.query) {
      Object.entries(endpoint.parameters.query).forEach(([name, schema]) => {
        parameters.push({
          name,
          in: "query",
          required: false,
          schema: zodToOpenAPISchema(schema),
        });
      });
    }

    // 操作定義
    const operation: {
      tags: string[];
      summary: string;
      operationId: string;
      description?: string;
      parameters?: Array<Record<string, unknown>>;
      requestBody?: Record<string, unknown>;
      responses: Record<string, unknown>;
    } = {
      tags: endpoint.tags,
      summary: endpoint.summary,
      operationId: endpoint.operationId,
      responses: {},
    };

    if (endpoint.description) {
      operation.description = endpoint.description;
    }

    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // リクエストボディ
    if (endpoint.requestBody) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: zodToOpenAPISchema(endpoint.requestBody.schema),
          },
        },
      };
      if (endpoint.requestBody.description) {
        operation.requestBody.description = endpoint.requestBody.description;
      }
    }

    // レスポンス
    Object.entries(endpoint.responses).forEach(([statusCode, response]) => {
      const responseObj: Record<string, unknown> = {
        description: response.description || `Response ${statusCode}`,
      };

      if (response.schema) {
        responseObj.content = {
          "application/json": {
            schema: zodToOpenAPISchema(response.schema),
          },
        };
      }

      operation.responses[statusCode] = responseObj;
    });

    paths[openAPIPath][endpoint.method.toLowerCase()] = operation;
  });

  return {
    openapi: "3.0.0",
    info: {
      title: "Scratch Status Monitor API",
      description: "Scratchサービスの稼働状況を監視するAPI",
      version: "1.0.0",
      contact: {
        name: "Scratch Status Monitor",
        url: "https://github.com/scratchcore/scratch-status-monitor",
      },
    },
    servers: [
      {
        url: "/",
        description: "開発環境",
      },
      {
        url: "https://api.ssm.scra.cc/",
        description: "本番環境",
      },
    ],
    tags,
    paths,
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  enum: [
                    "VALIDATION_ERROR",
                    "NOT_FOUND",
                    "INTERNAL_ERROR",
                    "TIMEOUT",
                    "UNAUTHORIZED",
                    "FORBIDDEN",
                    "BAD_REQUEST",
                  ],
                },
                message: {
                  type: "string",
                },
                details: {
                  type: "object",
                },
              },
              required: ["code", "message"],
            },
          },
          required: ["success", "error"],
        },
      },
    },
  };
}
