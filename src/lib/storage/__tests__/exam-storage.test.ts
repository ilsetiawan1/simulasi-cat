import { describe, expect, test } from "bun:test";
import {
  clearExamSession,
  clearPendingGuestResult,
  loadExamSession,
  loadPendingGuestResult,
  saveExamSession,
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
});
