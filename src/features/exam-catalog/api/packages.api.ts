import type { ExamCategory, ExamPackageRow } from "@/lib/supabase/types";

export async function fetchActivePackages(
  category?: ExamCategory,
): Promise<ExamPackageRow[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`/api/packages${query}`, { cache: "no-store" });
  const payload = (await response.json()) as {
    data?: ExamPackageRow[];
    error?: { message?: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Gagal memuat daftar paket tryout.");
  }

  return payload.data;
}
