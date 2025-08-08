import { describe, it, expect } from "vitest";
import {
  UnauthorizedError,
  createUnauthorizedError
} from "@/schemas/UnauthorizedError.js";

describe("UnauthorizedError", () => {
  it("バリデーションが通る（正常系）", () => {
    const data = createUnauthorizedError({
      "invalid-params": [
        { name: "email", reason: "Invalid format", location: "body" },
      ],
    });
    const result = UnauthorizedError.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが足りない場合は失敗する", () => {
    const result = UnauthorizedError.safeParse({});
    expect(result.success).toBe(false);
  });

  it("URLでないtypeは失敗する", () => {
    const data = createUnauthorizedError({ type: "not-a-url" as any });
    const result = UnauthorizedError.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("createUnauthorizedError のデフォルト値", () => {
    const error = createUnauthorizedError();
    expect(error.status).toBe(401);
    expect(error.title).toBe("Unauthorized");
    expect(error.type).toBe("https://datatracker.ietf.org/doc/rfc9457");
  });
});
