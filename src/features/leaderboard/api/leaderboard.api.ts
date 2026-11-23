import type { LeaderboardEntry } from "@/modules/scores/scores.service";

export async function fetchLeaderboard(
  packageId: string,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({
    packageId,
    limit: String(limit),
  });
  const response = await fetch(`/api/leaderboard?${params.toString()}`, {
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    data?: LeaderboardEntry[];
    error?: { message?: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Gagal memuat data papan peringkat.");
  }

  return payload.data;
}
