import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionSubtest } from "@/constants/passing-grade";
import type { QuestionRow } from "@/lib/supabase/types";

const QUESTION_COLUMNS =
  "id, package_id, subtest, question_text, image_url, options, shuffle_options, explanation, created_at";

export async function findQuestionsByPackageId(
  supabase: SupabaseClient,
  packageId: string,
): Promise<QuestionRow[]> {
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .eq("package_id", packageId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as QuestionRow[];
}

export async function findQuestionsBySubtest(
  supabase: SupabaseClient,
  subtest: QuestionSubtest,
): Promise<QuestionRow[]> {
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .eq("subtest", subtest)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as QuestionRow[];
}

export async function findQuestionsByIds(
  supabase: SupabaseClient,
  ids: readonly string[],
): Promise<QuestionRow[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .in("id", [...ids]);

  if (error) {
    throw error;
  }

  return (data ?? []) as QuestionRow[];
}
