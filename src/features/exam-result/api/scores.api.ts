import type { ScoreRow } from "@/lib/supabase/types";

export interface SubmitScorePayload {
  packageId: string;
  clientAttemptId: string;
  answers: Record<string, string>;
  durationSeconds: number;
}

export type SubmitScoreOutcome =
  | { status: "saved"; score: ScoreRow }
  | { status: "unauthorized" };

export async function submitExamScoreRequest(
  payload: SubmitScorePayload,
): Promise<SubmitScoreOutcome> {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    return { status: "unauthorized" };
  }

  const body = (await response.json()) as {
    data?: ScoreRow;
    error?: { message?: string };
  };

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Gagal menyimpan skor ke server.");
  }

  return { status: "saved", score: body.data };
}
