import { describe, it, expect } from "vitest";
import {
  BadRequestError,
  createBadRequestError,
} from "@/schemas/BadRequestError.js";

describe("BadRequestError", () => {
  it("バリデーションが通る（正常系）", () => {
    const data = createBadRequestError({
      "invalid-params": [
        { name: "email", reason: "Invalid format", location: "body" },
      ],
    });
    const result = BadRequestError.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが足りない場合は失敗する", () => {
    const result = BadRequestError.safeParse({});
    expect(result.success).toBe(false);
  });

  it("URLでないtypeは失敗する", () => {
    const data = createBadRequestError({ type: "not-a-url" as any });
    const result = BadRequestError.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("createBadRequestError のデフォルト値", () => {
    const error = createBadRequestError();
    expect(error.status).toBe(400);
    expect(error.title).toBe("Bad Request");
    expect(error.type).toBe("https://datatracker.ietf.org/doc/rfc9457");
  });
});
