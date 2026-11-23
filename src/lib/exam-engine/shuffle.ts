import { SKD_SUBTEST_ORDER } from "@/constants/passing-grade";
import type { ExamCategory, QuestionRow } from "@/lib/supabase/types";

export const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

export function getOptionLabel(index: number): string {
  return OPTION_LABELS[index] ?? String.fromCharCode(65 + index);
}

/**
 * Pure Fisher-Yates Shuffle (tidak memutasi array input).
 */
export function fisherYatesShuffle<T>(
  items: readonly T[],
  randomFn: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    const current = result[i];
    const swap = result[j];
    if (current !== undefined && swap !== undefined) {
      result[i] = swap;
      result[j] = current;
    }
  }
  return result;
}

export interface ShuffledExamOrder {
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
}

/**
 * Mengacak urutan soal per blok subtes (TWK -> TIU -> TKP untuk SKD_FULL)
 * serta mengacak urutan opsi jawaban kecuali soal dengan shuffle_options === false.
 */
export function buildExamSessionOrder(
  questions: readonly QuestionRow[],
  category: ExamCategory,
  randomFn: () => number = Math.random,
): ShuffledExamOrder {
  let orderedQuestions: QuestionRow[];

  if (category === "SKD_FULL") {
    orderedQuestions = [];
    for (const subtest of SKD_SUBTEST_ORDER) {
      const block = questions.filter((q) => q.subtest === subtest);
      orderedQuestions.push(...fisherYatesShuffle(block, randomFn));
    }
  } else {
    orderedQuestions = fisherYatesShuffle(questions, randomFn);
  }

  const questionOrder = orderedQuestions.map((q) => q.id);
  const optionOrders: Record<string, string[]> = {};

  for (const question of orderedQuestions) {
    const optionIds = question.options.map((opt) => opt.id);
    optionOrders[question.id] = question.shuffle_options
      ? fisherYatesShuffle(optionIds, randomFn)
      : optionIds;
  }

  return { questionOrder, optionOrders };
}
