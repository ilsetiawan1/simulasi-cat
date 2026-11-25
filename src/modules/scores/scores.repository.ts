import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoreRow } from "@/lib/supabase/types";

const SCORE_COLUMNS =
  "id, user_id, package_id, client_attempt_id, score_twk, score_tiu, score_tkp, score_skb, total_score, is_passed, duration_seconds, completed_at";

export interface InsertScorePayload {
  user_id: string;
  package_id: string;
  client_attempt_id: string;
  score_twk: number;
  score_tiu: number;
  score_tkp: number;
  score_skb: number;
  total_score: number;
  is_passed: boolean;
  duration_seconds: number;
}

export interface ScoreHistoryRow extends ScoreRow {
  exam_packages: {
    slug: string;
    title: string;
    category: string;
  } | null;
}

export interface LeaderboardQueryRow extends ScoreRow {
  profiles: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export async function findScoreByAttempt(
  supabase: SupabaseClient,
  userId: string,
  clientAttemptId: string,
): Promise<ScoreRow | null> {
  const { data, error } = await supabase
    .from("scores")
    .select(SCORE_COLUMNS)
    .eq("user_id", userId)
    .eq("client_attempt_id", clientAttemptId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ScoreRow | null) ?? null;
}

export async function insertScore(
  supabase: SupabaseClient,
  payload: InsertScorePayload,
): Promise<ScoreRow> {
  const { data, error } = await supabase
    .from("scores")
    .insert(payload)
    .select(SCORE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as ScoreRow;
}

export async function findScoresByUserId(
  supabase: SupabaseClient,
  userId: string,
  limit = 30,
): Promise<ScoreHistoryRow[]> {
  const { data, error } = await supabase
    .from("scores")
    .select(`${SCORE_COLUMNS}, exam_packages(slug, title, category)`)
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as ScoreHistoryRow[];
}

export async function findLeaderboardByPackageId(
  supabase: SupabaseClient,
  packageId: string,
  limit = 100,
): Promise<LeaderboardQueryRow[]> {
  // Mengikuti indeks komposit idx_scores_leaderboard_rank (Tie-Breaker BKN).
  // Ambil batch lebih besar untuk ruang deduplikasi 1 skor terbaik per user di service.
  const fetchLimit = Math.min(Math.max(limit * 5, 100), 500);
  const { data, error } = await supabase
    .from("scores")
    .select(`${SCORE_COLUMNS}, profiles(display_name, avatar_url)`)
    .eq("package_id", packageId)
    .order("total_score", { ascending: false })
    .order("score_tkp", { ascending: false })
    .order("score_tiu", { ascending: false })
    .order("score_twk", { ascending: false })
    .order("completed_at", { ascending: true })
    .limit(fetchLimit);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as LeaderboardQueryRow[];
}
