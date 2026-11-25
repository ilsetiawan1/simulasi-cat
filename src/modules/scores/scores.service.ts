import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateExamScore } from "@/lib/exam-engine/scoring";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ScoreRow } from "@/lib/supabase/types";
import { requireAuthUser } from "@/middlewares/auth-guard";
import { getActivePackageById } from "@/modules/packages/packages.service";
import { getQuestionsForScoring } from "@/modules/questions/questions.service";
import {
  findLeaderboardByPackageId,
  findScoreByAttempt,
  findScoresByUserId,
  insertScore,
  type ScoreHistoryRow,
} from "./scores.repository";

export interface SubmitScoreInput {
  packageId: string;
  clientAttemptId: string;
  answers: Record<string, string>;
  durationSeconds: number;
}

export interface SubmitScoreResult {
  score: ScoreRow;
  created: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  scoreId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  scoreTwk: number;
  scoreTiu: number;
  scoreTkp: number;
  scoreSkb: number;
  totalScore: number;
  isPassed: boolean;
  durationSeconds: number;
  completedAt: string;
}

function isUniqueViolationError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

/**
 * Menghitung ulang skor di server dari mapping answers (questionId -> option.id),
 * lalu menyimpan skor ke tabel scores dengan idempotency client_attempt_id.
 */
export async function submitExamScore(
  input: SubmitScoreInput,
  client?: SupabaseClient,
): Promise<SubmitScoreResult> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);

  const existing = await findScoreByAttempt(supabase, user.id, input.clientAttemptId);
  if (existing) {
    return { score: existing, created: false };
  }

  const { package: pkg, questions } = await getQuestionsForScoring(
    input.packageId,
    Object.keys(input.answers),
    supabase,
  );
  const computed = calculateExamScore(pkg, questions, input.answers);

  try {
    const inserted = await insertScore(supabase, {
      user_id: user.id,
      package_id: pkg.id,
      client_attempt_id: input.clientAttemptId,
      score_twk: computed.scoreTwk,
      score_tiu: computed.scoreTiu,
      score_tkp: computed.scoreTkp,
      score_skb: computed.scoreSkb,
      total_score: computed.totalScore,
      is_passed: computed.isPassed,
      duration_seconds: input.durationSeconds,
    });

    return { score: inserted, created: true };
  } catch (error) {
    if (isUniqueViolationError(error)) {
      const raced = await findScoreByAttempt(supabase, user.id, input.clientAttemptId);
      if (raced) {
        return { score: raced, created: false };
      }
    }
    throw error;
  }
}

export async function getMyScoreHistory(
  limit = 30,
  client?: SupabaseClient,
): Promise<ScoreHistoryRow[]> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);
  return findScoresByUserId(supabase, user.id, limit);
}

export async function getPackageLeaderboard(
  packageId: string,
  limit = 100,
  client?: SupabaseClient,
): Promise<LeaderboardEntry[]> {
  const supabase = client ?? (await createSupabaseServerClient());
  await getActivePackageById(packageId, supabase);

  const rows = await findLeaderboardByPackageId(supabase, packageId, limit);

  // 1 peserta = 1 baris (skor terbaik). Karena query sudah terurut tie-breaker BKN,
  // kemunculan pertama per user_id adalah skor terbaiknya pada paket ini.
  const seenUserIds = new Set<string>();
  const bestRows = rows.filter((row) => {
    if (seenUserIds.has(row.user_id)) return false;
    seenUserIds.add(row.user_id);
    return true;
  });

  return bestRows.slice(0, limit).map((row, index) => ({
    rank: index + 1,
    scoreId: row.id,
    userId: row.user_id,
    displayName: row.profiles?.display_name ?? "Peserta",
    avatarUrl: row.profiles?.avatar_url ?? null,
    scoreTwk: row.score_twk,
    scoreTiu: row.score_tiu,
    scoreTkp: row.score_tkp,
    scoreSkb: row.score_skb,
    totalScore: row.total_score,
    isPassed: row.is_passed,
    durationSeconds: row.duration_seconds,
    completedAt: row.completed_at,
  }));
}
