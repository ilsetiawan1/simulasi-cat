import { describe, expect, test } from "bun:test";
import type { QuestionRow } from "@/lib/supabase/types";
import { buildExamSessionOrder, fisherYatesShuffle, getOptionLabel } from "../shuffle";

function makeQuestion(
  id: string,
  subtest: QuestionRow["subtest"],
  shuffleOptions = true,
): QuestionRow {
  return {
    id,
    package_id: "11111111-1111-4111-8111-111111111101",
    subtest,
    question_text: `Soal ${id}`,
    image_url: null,
    options: [
      { id: "opt_1", text: "Opsi 1", score: 5 },
      { id: "opt_2", text: "Opsi 2", score: 0 },
      { id: "opt_3", text: "Opsi 3", score: 0 },
      { id: "opt_4", text: "Opsi 4", score: 0 },
      { id: "opt_5", text: "Semua benar", score: 0 },
    ],
    shuffle_options: shuffleOptions,
    explanation: "Pembahasan",
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("shuffle engine (Fisher-Yates)", () => {
  test("fisherYatesShuffle tidak memutasi array asli dan mempertahankan semua elemen", () => {
    const input = [1, 2, 3, 4, 5];
    const shuffled = fisherYatesShuffle(input, () => 0);

    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...shuffled].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    expect(shuffled).not.toEqual(input);
  });

  test("SKD_FULL menjaga urutan blok TWK -> TIU -> TKP walau input tercampur", () => {
    const mixed: QuestionRow[] = [
      makeQuestion("tkp-1", "TKP"),
      makeQuestion("tiu-1", "TIU"),
      makeQuestion("twk-1", "TWK"),
      makeQuestion("tkp-2", "TKP"),
      makeQuestion("twk-2", "TWK"),
      makeQuestion("tiu-2", "TIU"),
    ];

    const { questionOrder } = buildExamSessionOrder(mixed, "SKD_FULL", () => 0.2);

    expect(questionOrder.slice(0, 2).every((id) => id.startsWith("twk-"))).toBe(true);
    expect(questionOrder.slice(2, 4).every((id) => id.startsWith("tiu-"))).toBe(true);
    expect(questionOrder.slice(4, 6).every((id) => id.startsWith("tkp-"))).toBe(true);
  });

  test("shuffle_options = false mempertahankan urutan asli opsi jawaban", () => {
    const fixedQ = makeQuestion("twk-fixed", "TWK", false);
    const shuffledQ = makeQuestion("twk-rand", "TWK", true);

    const { optionOrders } = buildExamSessionOrder([fixedQ, shuffledQ], "MINI_TWK", () => 0);

    expect(optionOrders["twk-fixed"]).toEqual(["opt_1", "opt_2", "opt_3", "opt_4", "opt_5"]);
    expect(optionOrders["twk-rand"]).not.toEqual(["opt_1", "opt_2", "opt_3", "opt_4", "opt_5"]);
    expect(getOptionLabel(0)).toBe("A");
    expect(getOptionLabel(4)).toBe("E");
  });
});
