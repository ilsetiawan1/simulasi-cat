import { describe, expect, test } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/utils/http-response";
import { getPackageLeaderboard, submitExamScore } from "../scores.service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PKG_ID = "11111111-1111-4111-8111-111111111102";
const ATTEMPT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const Q_ID = "22222222-2222-4222-8222-222222222201";

function createMockSupabase(options: {
  authenticated?: boolean;
  existingScore?: Record<string, unknown> | null;
}) {
  const insertedPayloads: Record<string, unknown>[] = [];

  const mock = {
    auth: {
      async getUser() {
        if (options.authenticated === false) {
          return { data: { user: null }, error: null };
        }
        return { data: { user: { id: USER_ID } }, error: null };
      },
    },
    from(table: string) {
      if (table === "scores") {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      async maybeSingle() {
                        return { data: options.existingScore ?? null, error: null };
                      },
                    };
                  },
                };
              },
            };
          },
          insert(payload: Record<string, unknown>) {
            insertedPayloads.push(payload);
            return {
              select() {
                return {
                  async single() {
                    return {
                      data: {
                        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
                        completed_at: "2026-01-01T00:00:00Z",
                        ...payload,
                      },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      }

      if (table === "exam_packages") {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      async maybeSingle() {
                        return {
                          data: {
                            id: PKG_ID,
                            slug: "mini-twk-01",
                            title: "Mini TWK",
                            description: "",
                            category: "MINI_TWK",
                            duration_minutes: 25,
                            total_questions: 1,
                            passing_grade_twk: 5,
                            passing_grade_tiu: null,
                            passing_grade_tkp: null,
                            is_active: true,
                            created_at: "2026-01-01T00:00:00Z",
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
      }

      if (table === "questions") {
        return {
          select() {
            return {
              eq() {
                return {
                  async order() {
                    return {
                      data: [
                        {
                          id: Q_ID,
                          package_id: PKG_ID,
                          subtest: "TWK",
                          question_text: "Soal TWK",
                          image_url: null,
                          options: [
                            { id: "opt_1", text: "Benar", score: 5 },
                            { id: "opt_2", text: "Salah", score: 0 },
                          ],
                          shuffle_options: true,
                          explanation: "Pembahasan",
                          created_at: "2026-01-01T00:00:00Z",
                        },
                      ],
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  return { client: mock as unknown as SupabaseClient, insertedPayloads };
}

describe("scores.service", () => {
  test("menolak submit skor bila pengguna belum terautentikasi (401)", async () => {
    const { client } = createMockSupabase({ authenticated: false });

    await expect(
      submitExamScore(
        {
          packageId: PKG_ID,
          clientAttemptId: ATTEMPT_ID,
          answers: { [Q_ID]: "opt_1" },
          durationSeconds: 30,
        },
        client,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  test("menghitung ulang skor di server dari option.id stabil dan menyimpan dengan user_id terverifikasi", async () => {
    const { client, insertedPayloads } = createMockSupabase({ authenticated: true });

    const res = await submitExamScore(
      {
        packageId: PKG_ID,
        clientAttemptId: ATTEMPT_ID,
        answers: { [Q_ID]: "opt_1" },
        durationSeconds: 45,
      },
      client,
    );

    expect(res.created).toBe(true);
    expect(res.score.total_score).toBe(5);
    expect(res.score.score_twk).toBe(5);
    expect(res.score.is_passed).toBe(true);
    expect(insertedPayloads[0]?.user_id).toBe(USER_ID);
  });

  test("idempotent: mengembalikan skor yang sudah ada jika clientAttemptId sama dikirim ulang", async () => {
    const existing = {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      user_id: USER_ID,
      package_id: PKG_ID,
      client_attempt_id: ATTEMPT_ID,
      score_twk: 5,
      score_tiu: 0,
      score_tkp: 0,
      score_skb: 0,
      total_score: 5,
      is_passed: true,
      duration_seconds: 45,
      completed_at: "2026-01-01T00:00:00Z",
    };

    const { client, insertedPayloads } = createMockSupabase({
      authenticated: true,
      existingScore: existing,
    });

    const res = await submitExamScore(
      {
        packageId: PKG_ID,
        clientAttemptId: ATTEMPT_ID,
        answers: { [Q_ID]: "opt_2" },
        durationSeconds: 99,
      },
      client,
    );

    expect(res.created).toBe(false);
    expect(res.score.id).toBe(existing.id);
    expect(insertedPayloads.length).toBe(0);
  });

  test("leaderboard hanya menampilkan 1 skor terbaik per user dengan urutan rank berurutan", async () => {
    const leaderboardRows = [
      {
        id: "score-1",
        user_id: "user-a",
        package_id: PKG_ID,
        client_attempt_id: "att-1",
        score_twk: 100,
        score_tiu: 120,
        score_tkp: 190,
        score_skb: 0,
        total_score: 410,
        is_passed: true,
        duration_seconds: 3000,
        completed_at: "2026-01-01T01:00:00Z",
        profiles: { display_name: "Peserta A", avatar_url: null },
      },
      {
        id: "score-2",
        user_id: "user-a",
        package_id: PKG_ID,
        client_attempt_id: "att-2",
        score_twk: 80,
        score_tiu: 100,
        score_tkp: 170,
        score_skb: 0,
        total_score: 350,
        is_passed: true,
        duration_seconds: 3200,
        completed_at: "2026-01-01T02:00:00Z",
        profiles: { display_name: "Peserta A", avatar_url: null },
      },
      {
        id: "score-3",
        user_id: "user-b",
        package_id: PKG_ID,
        client_attempt_id: "att-3",
        score_twk: 75,
        score_tiu: 95,
        score_tkp: 175,
        score_skb: 0,
        total_score: 345,
        is_passed: true,
        duration_seconds: 3100,
        completed_at: "2026-01-01T03:00:00Z",
        profiles: { display_name: "Peserta B", avatar_url: null },
      },
    ];

    const chain = {
      order() {
        return chain;
      },
      async limit() {
        return { data: leaderboardRows, error: null };
      },
    };

    const mockClient = {
      from(table: string) {
        if (table === "exam_packages") {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async maybeSingle() {
                          return {
                            data: {
                              id: PKG_ID,
                              slug: "skd-penuh-01",
                              title: "Tryout SKD CPNS",
                              description: "",
                              category: "SKD_FULL",
                              duration_minutes: 100,
                              total_questions: 110,
                              passing_grade_twk: 65,
                              passing_grade_tiu: 80,
                              passing_grade_tkp: 166,
                              is_active: true,
                              created_at: "2026-01-01T00:00:00Z",
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
        }
        if (table === "scores") {
          return {
            select() {
              return {
                eq() {
                  return chain;
                },
              };
            },
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      },
    } as unknown as SupabaseClient;

    const entries = await getPackageLeaderboard(PKG_ID, 100, mockClient);
    expect(entries.length).toBe(2);
    expect(entries[0]?.userId).toBe("user-a");
    expect(entries[0]?.totalScore).toBe(410);
    expect(entries[0]?.rank).toBe(1);
    expect(entries[1]?.userId).toBe("user-b");
    expect(entries[1]?.rank).toBe(2);
  });
});
