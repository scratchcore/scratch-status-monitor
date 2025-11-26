import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeLog } from "@/utils/logger.js";

describe("makeLog", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  const log = makeLog();

  it("未知のレベルの場合は '32' (緑) が使われる", () => {
    log("unknown level test", "unknown" as any);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("\x1B[32mUNKNOWN\x1B[0m"),
    );
  });

  it("log.debug", async () => {
    log.debug("Hello World - debug");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Hello World - debug"),
    );
  });

  it("log.info", async () => {
    log.info("Hello World - info");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Hello World - info"),
    );
  });

  it("log.warn", async () => {
    log.warn("Hello World - warn");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Hello World - warn"),
    );
  });

  it("log.error", async () => {
    log.error("Hello World - error");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Hello World - error"),
    );
  });
});
