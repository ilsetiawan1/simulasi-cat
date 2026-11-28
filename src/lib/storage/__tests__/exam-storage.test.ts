import { describe, expect, test } from "bun:test";
import {
  loadLastExamResult,
  saveLastExamResult,
} from "@/features/cat-exam/utils/result-cache";
import {
  clearExamSession,
  clearPendingGuestResult,
  loadExamSession,
  loadExamSessionPayload,
  loadPendingGuestResult,
  saveExamSession,
  saveExamSessionPayload,
  savePendingGuestResult,
} from "../exam-storage";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("exam-storage (Zod localStorage persistence)", () => {
  test("menyimpan, membaca, dan membersihkan snapshot sesi CAT", () => {
    const storage = createMemoryStorage();
    const session = {
      version: 1 as const,
      clientAttemptId: "11111111-1111-4111-8111-111111111111",
      packageId: "11111111-1111-4111-8111-111111111101",
      packageSlug: "skd-penuh-01",
      startedAt: 1000,
      endTimestamp: 6001000,
      currentIndex: 3,
      questionOrder: ["22222222-2222-4222-8222-222222222101"],
      optionOrders: { "22222222-2222-4222-8222-222222222101": ["opt_2", "opt_1"] },
      answers: { "22222222-2222-4222-8222-222222222101": "opt_1" },
      flaggedIds: [],
    };

    saveExamSession(session, storage);
    expect(loadExamSession("skd-penuh-01", storage)).toEqual(session);

    clearExamSession("skd-penuh-01", storage);
    expect(loadExamSession("skd-penuh-01", storage)).toBeNull();
  });

  test("membersihkan payload localStorage yang korup secara aman", () => {
    const storage = createMemoryStorage();
    storage.setItem("simulasi_cat:session:skd-penuh-01", "{invalid-json");
    expect(loadExamSession("skd-penuh-01", storage)).toBeNull();
    expect(storage.getItem("simulasi_cat:session:skd-penuh-01")).toBeNull();

    savePendingGuestResult(
      {
        version: 1,
        clientAttemptId: "11111111-1111-4111-8111-111111111111",
        packageId: "11111111-1111-4111-8111-111111111101",
        packageSlug: "skd-penuh-01",
        answers: {},
        durationSeconds: 120,
        completedAt: "2026-01-01T00:00:00.000Z",
      },
      storage,
    );
    expect(loadPendingGuestResult(storage)?.packageSlug).toBe("skd-penuh-01");
    clearPendingGuestResult(storage);
    expect(loadPendingGuestResult(storage)).toBeNull();
  });

  test("menyimpan & membersihkan snapshot soal sesi aktif dan hasil akhir agar tidak hilang saat refresh/result", () => {
    const storage = createMemoryStorage();
    const pkg = {
      id: "11111111-1111-4111-8111-111111111101",
      slug: "skd-penuh-01",
      title: "Tryout SKD CPNS",
      description: "Simulasi SKD",
      category: "SKD_FULL" as const,
      duration_minutes: 100,
      total_questions: 110,
      passing_grade_twk: 65,
      passing_grade_tiu: 80,
      passing_grade_tkp: 166,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    const q1 = {
      id: "22222222-2222-4222-8222-222222222101",
      package_id: pkg.id,
      subtest: "TWK" as const,
      question_text: "Soal TWK contoh",
      image_url: null,
      options: [
        { id: "opt_1", text: "Benar", score: 5 },
        { id: "opt_2", text: "Salah", score: 0 },
      ],
      shuffle_options: true,
      explanation: "Pembahasan contoh",
      created_at: "2026-01-01T00:00:00.000Z",
    };

    saveExamSessionPayload("skd-penuh-01", { version: 1, package: pkg, questions: [q1] }, storage);
    const loadedPayload = loadExamSessionPayload("skd-penuh-01", storage);
    expect(loadedPayload?.questions.length).toBe(1);
    expect(loadedPayload?.questions[0]?.id).toBe(q1.id);

    clearExamSession("skd-penuh-01", storage);
    expect(loadExamSessionPayload("skd-penuh-01", storage)).toBeNull();

    saveLastExamResult(
      {
        version: 1,
        clientAttemptId: "33333333-3333-4333-8333-333333333333",
        packageId: pkg.id,
        packageSlug: pkg.slug,
        answers: { [q1.id]: "opt_1" },
        questionOrder: [q1.id],
        optionOrders: { [q1.id]: ["opt_2", "opt_1"] },
        durationSeconds: 180,
        completedAt: "2026-01-01T00:10:00.000Z",
        savedToServer: false,
        package: pkg,
        questions: [q1],
      },
      storage,
    );

    const loadedResult = loadLastExamResult("skd-penuh-01", storage);
    expect(loadedResult?.answers[q1.id]).toBe("opt_1");
    expect(loadedResult?.questions?.[0]?.id).toBe(q1.id);
  });
});
