import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExamPackageRow, QuestionRow } from "@/lib/supabase/types";
import { getActivePackageById, getActivePackageBySlug } from "@/modules/packages/packages.service";
import { findQuestionsByPackageId } from "./questions.repository";

export interface PackageQuestionsPayload {
  package: ExamPackageRow;
  questions: QuestionRow[];
}

export async function getQuestionsByPackageSlug(
  slug: string,
  client?: SupabaseClient,
): Promise<PackageQuestionsPayload> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await getActivePackageBySlug(slug, supabase);
  const questions = await findQuestionsByPackageId(supabase, pkg.id);
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
