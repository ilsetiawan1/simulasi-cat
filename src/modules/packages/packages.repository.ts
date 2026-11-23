import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExamCategory, ExamPackageRow } from "@/lib/supabase/types";

const PACKAGE_COLUMNS =
  "id, slug, title, description, category, duration_minutes, total_questions, passing_grade_twk, passing_grade_tiu, passing_grade_tkp, is_active, created_at";

export async function findActivePackages(
  supabase: SupabaseClient,
  category?: ExamCategory,
): Promise<ExamPackageRow[]> {
  let query = supabase
    .from("exam_packages")
    .select(PACKAGE_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as ExamPackageRow[];
}

export async function findActivePackageBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ExamPackageRow | null> {
  const { data, error } = await supabase
    .from("exam_packages")
    .select(PACKAGE_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ExamPackageRow | null) ?? null;
}

export async function findActivePackageById(
  supabase: SupabaseClient,
  id: string,
): Promise<ExamPackageRow | null> {
  const { data, error } = await supabase
    .from("exam_packages")
    .select(PACKAGE_COLUMNS)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ExamPackageRow | null) ?? null;
}
