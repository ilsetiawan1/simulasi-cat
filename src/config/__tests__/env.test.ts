import { describe, expect, test } from "bun:test";
import { parsePublicEnv } from "../env";

describe("parsePublicEnv", () => {
  test("menerima variabel environment Supabase yang valid", () => {
    const result = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-sample",
    });

    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key-sample");
  });

  test("menolak URL Supabase yang tidak valid atau anon key kosong", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "bukan-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toThrow();
  });
});
