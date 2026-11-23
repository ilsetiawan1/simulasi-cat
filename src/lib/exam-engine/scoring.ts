import { SKD_PASSING_GRADE } from "@/constants/passing-grade";
import type { ExamPackageRow, QuestionOption, QuestionRow } from "@/lib/supabase/types";

export interface QuestionReview {
  questionId: string;
  subtest: QuestionRow["subtest"];
  selectedOptionId: string | null;
  bestOptionId: string | null;
  earnedScore: number;
  maxScore: number;
  isOptimal: boolean;
}

export interface ExamScoreResult {
  scoreTwk: number;
  scoreTiu: number;
  scoreTkp: number;
  scoreSkb: number;
  totalScore: number;
  isPassed: boolean;
  subtestPassed: {
    twk: boolean | null;
    tiu: boolean | null;
    tkp: boolean | null;
  };
  answeredCount: number;
  totalQuestions: number;
  reviews: QuestionReview[];
}

function findBestOption(options: readonly QuestionOption[]): QuestionOption | null {
  let best: QuestionOption | null = null;
  for (const opt of options) {
    if (!best || opt.score > best.score) {
      best = opt;
    }
  }
  return best;
}

/**
 * Pure scoring function (dipakai bersama Client Guest Mode & Server POST /api/scores).
 * Mapping answers menggunakan option.id yang stabil (bukan label dinamis A-E).
 */
export function calculateExamScore(
  pkg: Pick<
    ExamPackageRow,
    "category" | "passing_grade_twk" | "passing_grade_tiu" | "passing_grade_tkp"
  >,
  questions: readonly QuestionRow[],
  answers: Record<string, string>,
): ExamScoreResult {
  let scoreTwk = 0;
  let scoreTiu = 0;
  let scoreTkp = 0;
  let scoreSkb = 0;
  let answeredCount = 0;
  const reviews: QuestionReview[] = [];

  for (const question of questions) {
    const selectedId = answers[question.id] ?? null;
    const selectedOption = selectedId
      ? (question.options.find((opt) => opt.id === selectedId) ?? null)
      : null;
    const bestOption = findBestOption(question.options);
    const earnedScore = selectedOption ? selectedOption.score : 0;
    const maxScore = bestOption ? bestOption.score : 0;

    if (selectedOption) {
      answeredCount += 1;
    }

    if (question.subtest === "TWK") {
      scoreTwk += earnedScore;
    } else if (question.subtest === "TIU") {
      scoreTiu += earnedScore;
    } else if (question.subtest === "TKP") {
      scoreTkp += earnedScore;
    } else if (question.subtest === "SKB") {
      scoreSkb += earnedScore;
    }

    reviews.push({
      questionId: question.id,
      subtest: question.subtest,
      selectedOptionId: selectedOption ? selectedOption.id : null,
      bestOptionId: bestOption ? bestOption.id : null,
      earnedScore,
      maxScore,
      isOptimal: maxScore > 0 && earnedScore === maxScore,
    });
  }

  const totalScore = scoreTwk + scoreTiu + scoreTkp + scoreSkb;

  const pgTwk = pkg.passing_grade_twk ?? SKD_PASSING_GRADE.TWK;
  const pgTiu = pkg.passing_grade_tiu ?? SKD_PASSING_GRADE.TIU;
  const pgTkp = pkg.passing_grade_tkp ?? SKD_PASSING_GRADE.TKP;

  let isPassed = true;
  const subtestPassed: ExamScoreResult["subtestPassed"] = {
    twk: null,
    tiu: null,
    tkp: null,
  };

  if (pkg.category === "SKD_FULL") {
    subtestPassed.twk = scoreTwk >= pgTwk;
    subtestPassed.tiu = scoreTiu >= pgTiu;
    subtestPassed.tkp = scoreTkp >= pgTkp;
    isPassed = subtestPassed.twk && subtestPassed.tiu && subtestPassed.tkp;
  } else if (pkg.category === "MINI_TWK") {
    subtestPassed.twk = scoreTwk >= pgTwk;
    isPassed = subtestPassed.twk;
  } else if (pkg.category === "MINI_TIU") {
    subtestPassed.tiu = scoreTiu >= pgTiu;
    isPassed = subtestPassed.tiu;
  } else if (pkg.category === "MINI_TKP") {
    subtestPassed.tkp = scoreTkp >= pgTkp;
    isPassed = subtestPassed.tkp;
  } else if (pkg.category === "SKB") {
    // SKB tidak memakai passing grade SKD; default lulus jika tidak ada batas khusus pada paket
    isPassed = true;
  }

  return {
    scoreTwk,
    scoreTiu,
    scoreTkp,
    scoreSkb,
    totalScore,
    isPassed,
    subtestPassed,
    answeredCount,
    totalQuestions: questions.length,
    reviews,
  };
}
