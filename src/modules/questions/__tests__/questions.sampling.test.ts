import { describe, expect, test } from "bun:test";
import type { QuestionSubtest } from "@/constants/passing-grade";
import type { QuestionRow } from "@/lib/supabase/types";
import { samplePackageQuestions } from "../questions.service";

function makePool(counts: Partial<Record<QuestionSubtest, number>>, packageId = "pkg-skd"): QuestionRow[] {
  const rows: QuestionRow[] = [];
  const subtests: QuestionSubtest[] = ["TWK", "TIU", "TKP", "SKB"];
  for (const subtest of subtests) {
    const count = counts[subtest] ?? 0;
    for (let i = 1; i <= count; i += 1) {
      rows.push({
        id: `${subtest.toLowerCase()}-${i}`,
        package_id: packageId,
        subtest,
        question_text: `Soal ${subtest} #${i}`,
        image_url: null,
        options: [
          { id: "opt_a", text: "A", score: 5 },
          { id: "opt_b", text: "B", score: 0 },
        ],
        shuffle_options: true,
        explanation: "Pembahasan",
        created_at: "2026-01-01T00:00:00Z",
      });
    }
  }
  return rows;
}

describe("samplePackageQuestions", () => {
  test("SKD_FULL mengambil tepat 110 soal dari pool 240/201/231 dengan urutan blok ketat TWK -> TIU -> TKP dan nol duplikasi", () => {
    const pool = makePool({ TWK: 240, TIU: 201, TKP: 231 });
    const sampled = samplePackageQuestions(
      { category: "SKD_FULL", total_questions: 110 },
      pool,
    );

    expect(sampled.length).toBe(110);

    const uniqueIds = new Set(sampled.map((q) => q.id));
    expect(uniqueIds.size).toBe(110);

    const twkBlock = sampled.slice(0, 30);
    const tiuBlock = sampled.slice(30, 65);
    const tkpBlock = sampled.slice(65, 110);

    expect(twkBlock.every((q) => q.subtest === "TWK")).toBe(true);
    expect(tiuBlock.every((q) => q.subtest === "TIU")).toBe(true);
    expect(tkpBlock.every((q) => q.subtest === "TKP")).toBe(true);
  });

  test("SKD_FULL menghasilkan kombinasi soal berbeda antar sesi", () => {
    const pool = makePool({ TWK: 240, TIU: 201, TKP: 231 });
    const sessionA = samplePackageQuestions(
      { category: "SKD_FULL", total_questions: 110 },
      pool,
    ).map((q) => q.id);
    const sessionB = samplePackageQuestions(
      { category: "SKD_FULL", total_questions: 110 },
      pool,
    ).map((q) => q.id);

    expect(sessionA).not.toEqual(sessionB);
  });

  test("MINI_TWK, MINI_TIU, dan MINI_TKP mengambil tepat 30 / 35 / 45 soal unik sesuai subtes", () => {
    const pool = makePool({ TWK: 240, TIU: 201, TKP: 231 });

    const twk = samplePackageQuestions({ category: "MINI_TWK", total_questions: 30 }, pool);
    expect(twk.length).toBe(30);
    expect(new Set(twk.map((q) => q.id)).size).toBe(30);
    expect(twk.every((q) => q.subtest === "TWK")).toBe(true);

    const tiu = samplePackageQuestions({ category: "MINI_TIU", total_questions: 35 }, pool);
    expect(tiu.length).toBe(35);
    expect(new Set(tiu.map((q) => q.id)).size).toBe(35);
    expect(tiu.every((q) => q.subtest === "TIU")).toBe(true);

    const tkp = samplePackageQuestions({ category: "MINI_TKP", total_questions: 45 }, pool);
    expect(tkp.length).toBe(45);
    expect(new Set(tkp.map((q) => q.id)).size).toBe(45);
    expect(tkp.every((q) => q.subtest === "TKP")).toBe(true);
  });

  test("backward-compatible bila ukuran pool lebih kecil dari target (starter seed)", () => {
    const starterPool = makePool({ TWK: 3, TIU: 3, TKP: 3 });
    const sampled = samplePackageQuestions(
      { category: "SKD_FULL", total_questions: 110 },
      starterPool,
    );

    expect(sampled.length).toBe(9);
    expect(sampled.slice(0, 3).every((q) => q.subtest === "TWK")).toBe(true);
    expect(sampled.slice(3, 6).every((q) => q.subtest === "TIU")).toBe(true);
    expect(sampled.slice(6, 9).every((q) => q.subtest === "TKP")).toBe(true);
  });

  test("SKB mengambil hingga total_questions dari pool paket SKB", () => {
    const skbPool = makePool({ SKB: 120 }, "pkg-skb");
    const sampled = samplePackageQuestions({ category: "SKB", total_questions: 100 }, skbPool);

    expect(sampled.length).toBe(100);
    expect(new Set(sampled.map((q) => q.id)).size).toBe(100);
    expect(sampled.every((q) => q.subtest === "SKB")).toBe(true);
  });
});
