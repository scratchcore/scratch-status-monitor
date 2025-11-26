import { describe, it, expect } from "vitest";
import {
  ForbiddenError,
  createForbiddenError,
} from "@/schemas/ForbiddenError.js";

describe("ForbiddenError", () => {
  it("バリデーションが通る（正常系）", () => {
    const data = createForbiddenError({
      "invalid-params": [
        { name: "email", reason: "Invalid format", location: "body" },
      ],
    });
    const result = ForbiddenError.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが足りない場合は失敗する", () => {
    const result = ForbiddenError.safeParse({});
    expect(result.success).toBe(false);
  });

  it("URLでないtypeは失敗する", () => {
    const data = createForbiddenError({ type: "not-a-url" as any });
    const result = ForbiddenError.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("createForbiddenError のデフォルト値", () => {
    const error = createForbiddenError();
    expect(error.status).toBe(403);
    expect(error.title).toBe("Forbidden");
    expect(error.type).toBe("https://datatracker.ietf.org/doc/rfc9457");
  });
});
