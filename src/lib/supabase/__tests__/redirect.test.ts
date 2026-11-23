import { describe, expect, test } from "bun:test";
import { sanitizeRedirectPath } from "../redirect";

describe("sanitizeRedirectPath", () => {
  test("mengizinkan path relatif internal yang valid", () => {
    expect(sanitizeRedirectPath("/leaderboard")).toBe("/leaderboard");
    expect(sanitizeRedirectPath("/result/skd-penuh-01?saved=1")).toBe(
      "/result/skd-penuh-01?saved=1",
    );
  });

  test("menolak URL eksternal, protocol-relative, dan backslash open redirect", () => {
    expect(sanitizeRedirectPath("https://evil.example/phish")).toBe("/");
    expect(sanitizeRedirectPath("//evil.example")).toBe("/");
    expect(sanitizeRedirectPath("/\\evil.example")).toBe("/");
    expect(sanitizeRedirectPath("")).toBe("/");
    expect(sanitizeRedirectPath(null)).toBe("/");
  });
});
