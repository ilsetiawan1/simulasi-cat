import { describe, expect, test } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/utils/http-response";
import { submitExamScore } from "../scores.service";

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
});
