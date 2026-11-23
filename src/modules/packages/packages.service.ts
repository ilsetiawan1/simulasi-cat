import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExamCategory, ExamPackageRow } from "@/lib/supabase/types";
import { AppError } from "@/utils/http-response";
import {
  findActivePackageById,
  findActivePackageBySlug,
  findActivePackages,
} from "./packages.repository";

export async function listActivePackages(
  category?: ExamCategory,
  client?: SupabaseClient,
): Promise<ExamPackageRow[]> {
  const supabase = client ?? (await createSupabaseServerClient());
  return findActivePackages(supabase, category);
}

export async function getActivePackageBySlug(
  slug: string,
  client?: SupabaseClient,
): Promise<ExamPackageRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await findActivePackageBySlug(supabase, slug);
  if (!pkg) {
    throw new AppError(404, "PACKAGE_NOT_FOUND", "Paket ujian tidak ditemukan atau tidak aktif.");
  }
  return pkg;
}

export async function getActivePackageById(
  id: string,
  client?: SupabaseClient,
): Promise<ExamPackageRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const pkg = await findActivePackageById(supabase, id);
  if (!pkg) {
    throw new AppError(404, "PACKAGE_NOT_FOUND", "Paket ujian tidak ditemukan atau tidak aktif.");
  }
  return pkg;
}
