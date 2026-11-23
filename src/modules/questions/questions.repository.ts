import type { SupabaseClient } from "@supabase/supabase-js";
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
