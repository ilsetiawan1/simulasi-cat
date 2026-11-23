import type { ExamPackageRow, QuestionRow } from "@/lib/supabase/types";

export interface PackageQuestionsResponse {
  package: ExamPackageRow;
  questions: QuestionRow[];
}

export async function fetchPackageQuestions(
  slug: string,
): Promise<PackageQuestionsResponse> {
  const response = await fetch(
    `/api/packages/${encodeURIComponent(slug)}/questions`,
    { cache: "no-store" },
  );

  const payload = (await response.json()) as {
    data?: PackageQuestionsResponse;
    error?: { message?: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(
      payload.error?.message ?? "Gagal memuat soal untuk paket ujian ini.",
    );
  }

  return payload.data;
}
