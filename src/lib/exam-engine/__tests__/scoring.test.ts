import { describe, expect, test } from "bun:test";
import type { ExamPackageRow, QuestionRow } from "@/lib/supabase/types";
import { calculateExamScore } from "../scoring";

function makeQ(id: string, subtest: QuestionRow["subtest"], bestScore = 5): QuestionRow {
  return {
    id,
    package_id: "11111111-1111-4111-8111-111111111101",
    subtest,
    question_text: id,
    image_url: null,
    options: [
      { id: "opt_best", text: "Benar", score: bestScore },
      { id: "opt_low", text: "Rendah", score: subtest === "TKP" ? 1 : 0 },
    ],
    shuffle_options: true,
    explanation: "",
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("calculateExamScore", () => {
  test("SKD_FULL lulus tepat pada batas KepmenPANRB 321/2024 (TWK=65, TIU=80, TKP=166)", () => {
    const pkg: Pick<
      ExamPackageRow,
      "category" | "passing_grade_twk" | "passing_grade_tiu" | "passing_grade_tkp"
    > = {
      category: "SKD_FULL",
      passing_grade_twk: 65,
      passing_grade_tiu: 80,
      passing_grade_tkp: 166,
    };

    const questions: QuestionRow[] = [
      // 13 TWK * 5 = 65
      ...Array.from({ length: 13 }, (_, i) => makeQ(`twk-${i}`, "TWK", 5)),
      // 16 TIU * 5 = 80
      ...Array.from({ length: 16 }, (_, i) => makeQ(`tiu-${i}`, "TIU", 5)),
      // 33 TKP * 5 + 1 TKP * 1 = 166
      ...Array.from({ length: 33 }, (_, i) => makeQ(`tkp-${i}`, "TKP", 5)),
      makeQ("tkp-last", "TKP", 5),
    ];

    const answers: Record<string, string> = {};
    for (const q of questions) {
      answers[q.id] = q.id === "tkp-last" ? "opt_low" : "opt_best";
    }

    const res = calculateExamScore(pkg, questions, answers);
    expect(res.scoreTwk).toBe(65);
    expect(res.scoreTiu).toBe(80);
    expect(res.scoreTkp).toBe(166);
    expect(res.totalScore).toBe(311);
    expect(res.isPassed).toBe(true);

    // Kurangi 1 jawaban TWK (60 < 65) -> tidak lulus walau total tinggi
    delete answers["twk-0"];
    const failRes = calculateExamScore(pkg, questions, answers);
    expect(failRes.scoreTwk).toBe(60);
    expect(failRes.isPassed).toBe(false);
    expect(failRes.subtestPassed.twk).toBe(false);
    expect(failRes.subtestPassed.tiu).toBe(true);
    expect(failRes.subtestPassed.tkp).toBe(true);
  });

  test("MINI_TWK hanya mengevaluasi passing grade TWK", () => {
    const pkg = {
      category: "MINI_TWK" as const,
      passing_grade_twk: 65,
      passing_grade_tiu: null,
      passing_grade_tkp: null,
    };
    const questions = Array.from({ length: 13 }, (_, i) => makeQ(`twk-${i}`, "TWK", 5));
    const answers = Object.fromEntries(questions.map((q) => [q.id, "opt_best"]));

    const res = calculateExamScore(pkg, questions, answers);
    expect(res.scoreTwk).toBe(65);
    expect(res.isPassed).toBe(true);
    expect(res.subtestPassed).toEqual({ twk: true, tiu: null, tkp: null });
  });

  test("SKB menghitung benar +5, salah/kosong 0 dan default lulus", () => {
    const pkg = {
      category: "SKB" as const,
      passing_grade_twk: null,
      passing_grade_tiu: null,
      passing_grade_tkp: null,
    };
    const questions = [makeQ("skb-1", "SKB", 5), makeQ("skb-2", "SKB", 5)];
    const res = calculateExamScore(pkg, questions, { "skb-1": "opt_best" });

    expect(res.scoreSkb).toBe(5);
    expect(res.totalScore).toBe(5);
    expect(res.isPassed).toBe(true);
    expect(res.answeredCount).toBe(1);
  });
});
