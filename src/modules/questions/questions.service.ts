import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SKD_QUESTION_COUNTS,
  SKD_SUBTEST_ORDER,
  type SkdSubtest,
} from "@/constants/passing-grade";
import { fisherYatesShuffle } from "@/lib/exam-engine/shuffle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExamCategory, ExamPackageRow, QuestionRow } from "@/lib/supabase/types";
import { getActivePackageById, getActivePackageBySlug } from "@/modules/packages/packages.service";
import { AppError } from "@/utils/http-response";
import {
  findQuestionsByIds,
  findQuestionsByPackageId,
  findQuestionsBySubtest,
} from "./questions.repository";

export interface PackageQuestionsPayload {
  package: ExamPackageRow;
  questions: QuestionRow[];
}

function getMiniSubtest(category: ExamCategory): SkdSubtest | null {
  if (category === "MINI_TWK") return "TWK";
  if (category === "MINI_TIU") return "TIU";
  if (category === "MINI_TKP") return "TKP";
  return null;
}

/**
 * Mengambil sampel acak soal untuk satu sesi ujian tanpa mutasi pool.
 * - SKD_FULL: acak per blok subtes dengan urutan blok ketat TWK (30) -> TIU (35) -> TKP (45).
 * - MINI_TWK/MINI_TIU/MINI_TKP: acak dari shared bank subtes terkait sejumlah total_questions.
 * - SKB: acak dari pool paket SKB terkait sejumlah total_questions.
 */
export function samplePackageQuestions(
  pkg: Pick<ExamPackageRow, "category" | "total_questions">,
  pool: readonly QuestionRow[],
  randomFn: () => number = Math.random,
): QuestionRow[] {
  if (pkg.category === "SKD_FULL") {
    const sampled: QuestionRow[] = [];
    for (const subtest of SKD_SUBTEST_ORDER) {
      const block = pool.filter((q) => q.subtest === subtest);
      const target = SKD_QUESTION_COUNTS[subtest];
      sampled.push(...fisherYatesShuffle(block, randomFn).slice(0, target));
    }
    return sampled;
  }

  const miniSubtest = getMiniSubtest(pkg.category);
  const eligible = miniSubtest ? pool.filter((q) => q.subtest === miniSubtest) : pool;
  return fisherYatesShuffle(eligible, randomFn).slice(0, pkg.total_questions);
}

export async function getQuestionsByPackageSlug(
  slug: string,
  client?: SupabaseClient,
): Promise<PackageQuestionsPayload> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await getActivePackageBySlug(slug, supabase);
  const miniSubtest = getMiniSubtest(pkg.category);
  const pool = miniSubtest
    ? await findQuestionsBySubtest(supabase, miniSubtest)
    : await findQuestionsByPackageId(supabase, pkg.id);
  const questions = samplePackageQuestions(pkg, pool);
  return { package: pkg, questions };
}

export async function getQuestionsByPackageId(
  packageId: string,
  client?: SupabaseClient,
): Promise<PackageQuestionsPayload> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await getActivePackageById(packageId, supabase);
  const questions = await findQuestionsByPackageId(supabase, pkg.id);
  return { package: pkg, questions };
}

/**
 * Mengambil & memvalidasi soal berdasarkan daftar ID yang dijawab peserta saat submit skor.
 * Mencegah manipulasi ID soal lintas paket/subtes maupun inflasi jumlah jawaban melebihi kuota.
 */
export async function getQuestionsForScoring(
  packageId: string,
  questionIds: readonly string[],
  client?: SupabaseClient,
): Promise<PackageQuestionsPayload> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await getActivePackageById(packageId, supabase);

  const uniqueIds = Array.from(new Set(questionIds));
  if (uniqueIds.length === 0) {
    return { package: pkg, questions: [] };
  }

  const rows = await findQuestionsByIds(supabase, uniqueIds);
  const miniSubtest = getMiniSubtest(pkg.category);

  let validQuestions: QuestionRow[];
  if (miniSubtest) {
    validQuestions = rows.filter((q) => q.subtest === miniSubtest);
    if (validQuestions.length > pkg.total_questions) {
      throw new AppError(400, "INVALID_ANSWERS", "Jumlah jawaban melebihi kuota soal paket ujian.");
    }
  } else if (pkg.category === "SKD_FULL") {
    validQuestions = rows.filter(
      (q) =>
        q.package_id === pkg.id &&
        (q.subtest === "TWK" || q.subtest === "TIU" || q.subtest === "TKP"),
    );
    for (const subtest of SKD_SUBTEST_ORDER) {
      const count = validQuestions.filter((q) => q.subtest === subtest).length;
      if (count > SKD_QUESTION_COUNTS[subtest]) {
        throw new AppError(
          400,
          "INVALID_ANSWERS",
          "Jumlah jawaban melebihi kuota soal paket ujian.",
        );
      }
    }
  } else {
    validQuestions = rows.filter((q) => q.package_id === pkg.id);
    if (validQuestions.length > pkg.total_questions) {
      throw new AppError(400, "INVALID_ANSWERS", "Jumlah jawaban melebihi kuota soal paket ujian.");
    }
  }

  return { package: pkg, questions: validQuestions };
}
