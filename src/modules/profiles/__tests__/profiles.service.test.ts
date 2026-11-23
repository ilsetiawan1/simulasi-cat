import { describe, expect, test } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { AppError } from "@/utils/http-response";
import { handleUpdateProfile, PRESET_AVATAR_PATHS } from "../profiles.controller";
import { getMyProfile, updateMyProfile } from "../profiles.service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function createMockSupabase(options: { authenticated: boolean }) {
  const updates: Record<string, unknown>[] = [];

  const mock = {
    auth: {
      async getUser() {
        if (!options.authenticated) {
          return { data: { user: null }, error: null };
        }
        return { data: { user: { id: USER_ID } }, error: null };
      },
    },
    from(table: string) {
      if (table !== "profiles") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        select() {
          return {
            eq() {
              return {
                async maybeSingle() {
                  return {
                    data: {
                      id: USER_ID,
                      display_name: "Peserta Uji",
                      avatar_url: null,
                      created_at: "2026-01-01T00:00:00Z",
                      updated_at: "2026-01-01T00:00:00Z",
                    },
                    error: null,
                  };
                },
              };
            },
          };
        },
        update(payload: Record<string, unknown>) {
          updates.push(payload);
          return {
            eq() {
              return {
                select() {
                  return {
                    async single() {
                      return {
                        data: {
                          id: USER_ID,
                          display_name:
                            (payload.display_name as string | undefined) ?? "Peserta Uji",
                          avatar_url:
                            (payload.avatar_url as string | null | undefined) ?? null,
                          created_at: "2026-01-01T00:00:00Z",
                          updated_at: "2026-01-01T00:00:00Z",
                        },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  return { client: mock as unknown as SupabaseClient, updates };
}

describe("profiles.service & controller validation", () => {
  test("menolak akses profil bila belum login (401)", async () => {
    const { client } = createMockSupabase({ authenticated: false });
    await expect(getMyProfile(client)).rejects.toBeInstanceOf(AppError);
  });

  test("memperbarui display_name dan avatar_url preset dengan aman", async () => {
    const { client, updates } = createMockSupabase({ authenticated: true });
    const updated = await updateMyProfile(
      {
        displayName: "  Budi Santoso  ",
        avatarUrl: PRESET_AVATAR_PATHS[0],
      },
      client,
    );

    expect(updated.display_name).toBe("Budi Santoso");
    expect(updated.avatar_url).toBe("/avatars/preset-1.svg");
    expect(updates[0]?.display_name).toBe("Budi Santoso");
  });

  test("controller menolak avatarUrl berbahaya (javascript:, http:, path traversal)", async () => {
    const invalidUrls = [
      "javascript:alert(1)",
      "http://insecure.example.com/a.png",
      "/avatars/../etc/passwd",
      "data:text/html,<script>alert(1)</script>",
    ];

    for (const badUrl of invalidUrls) {
      const req = new NextRequest("http://localhost:3000/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: badUrl }),
      });

      const res = await handleUpdateProfile(req);
      expect(res.status).toBe(400);
    }
  });

  test("controller menolak payload kosong tanpa displayName maupun avatarUrl", async () => {
    const req = new NextRequest("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await handleUpdateProfile(req);
    expect(res.status).toBe(400);
  });
});
