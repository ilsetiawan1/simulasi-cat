import { describe, expect, test } from "bun:test";
import { getSiteUrl } from "../site";

describe("getSiteUrl", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  test("mengembalikan fallback localhost jika env kosong atau tidak valid", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";
    expect(getSiteUrl()).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_SITE_URL = "bukan-url";
    expect(getSiteUrl()).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  test("menghapus trailing slash dari NEXT_PUBLIC_SITE_URL yang valid", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://simcat.vercel.app/";
    expect(getSiteUrl()).toBe("https://simcat.vercel.app");

    process.env.NEXT_PUBLIC_SITE_URL = original;
  });
});
