import { describe, it, expect } from "vitest";
import { NotFoundError, createNotFoundError } from "@/schemas/NotFoundError.js";

describe("NotFoundError", () => {
  it("バリデーションが通る（正常系）", () => {
    const data = createNotFoundError({
      "invalid-params": [
        { name: "email", reason: "Invalid format", location: "body" },
      ],
    });
    const result = NotFoundError.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが足りない場合は失敗する", () => {
    const result = NotFoundError.safeParse({});
    expect(result.success).toBe(false);
  });

  it("URLでないtypeは失敗する", () => {
    const data = createNotFoundError({ type: "not-a-url" as any });
    const result = NotFoundError.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("createNotFoundError のデフォルト値", () => {
    const error = createNotFoundError();
    expect(error.status).toBe(404);
    expect(error.title).toBe("Not Found");
    expect(error.type).toBe("https://datatracker.ietf.org/doc/rfc9457");
  });
});
