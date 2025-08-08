import { describe, it, expect } from "vitest";
import {
  UnprocessableEntity,
  createUnprocessableEntityError,
} from "@/schemas/UnprocessableEntity.js";

describe("UnprocessableEntity", () => {
  it("バリデーションが通る（正常系）", () => {
    const data = createUnprocessableEntityError({
      "invalid-params": [
        { name: "email", reason: "Invalid format", location: "body" },
      ],
    });
    const result = UnprocessableEntity.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが足りない場合は失敗する", () => {
    const result = UnprocessableEntity.safeParse({});
    expect(result.success).toBe(false);
  });

  it("URLでないtypeは失敗する", () => {
    const data = createUnprocessableEntityError({ type: "not-a-url" as any });
    const result = UnprocessableEntity.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("createUnprocessableEntityError のデフォルト値", () => {
    const error = createUnprocessableEntityError();
    expect(error.status).toBe(422);
    expect(error.title).toBe("Unprocessable Entity");
    expect(error.type).toBe("https://datatracker.ietf.org/doc/rfc9457");
  });
});
