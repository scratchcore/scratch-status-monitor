import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoText } from "@/utils/logo.js";

vi.mock("figlet", async () => {
  const actual: any = await vi.importActual("figlet");
  return {
    ...actual,
    __esModule: true,
    default: (text: string, cb: (err: unknown, data: string) => void) => {
      cb(null, `FIGLET: ${text}`);
    },
  };
});

describe("LogoText", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("console.log に出力される（test=false のとき）", async () => {
    await LogoText("Hello");
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("FIGLET"));
  });

  it("test=true のときは console.log を呼ばない", async () => {
    await LogoText("Hello", true);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("figletでエラーが発生した場合はrejectされる", async () => {
    // figletのモックを一時的にエラーを返すように上書き
    const figlet = await import("figlet");
    const originalFiglet = figlet.default;
    vi.spyOn(figlet, "default").mockImplementation((_text, cb: any) => {
      cb(new Error("figlet error"), undefined);
    });

    await expect(LogoText("Hello")).rejects.toThrow("figlet error");

    // モックを元に戻す
    (figlet.default as any).mockRestore &&
      (figlet.default as any).mockRestore();
    figlet.default = originalFiglet;
  });
});
