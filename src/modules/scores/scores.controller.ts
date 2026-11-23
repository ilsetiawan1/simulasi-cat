import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/middlewares/error-handler";
import { jsonOk } from "@/utils/http-response";
import {
  getMyScoreHistory,
  getPackageLeaderboard,
  submitExamScore,
} from "./scores.service";

const submitScoreBodySchema = z.object({
  packageId: z.string().uuid("packageId harus berupa UUID valid."),
  clientAttemptId: z.string().uuid("clientAttemptId harus berupa UUID valid."),
  answers: z.record(z.string().uuid(), z.string().min(1).max(64)),
  durationSeconds: z.number().int().min(0).max(86400),
});

const leaderboardQuerySchema = z.object({
  packageId: z.string().uuid("packageId harus berupa UUID valid."),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const myHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export async function handleSubmitScore(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const parsed = submitScoreBodySchema.parse(body);

    const result = await submitExamScore(parsed);
    return jsonOk(result.score, result.created ? 201 : 200);
  });
}

export async function handleGetMyScores(request: NextRequest) {
  return handleApiError(async () => {
    const url = new URL(request.url);
    const { limit } = myHistoryQuerySchema.parse({
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const history = await getMyScoreHistory(limit);
    return jsonOk(history);
  });
}

export async function handleGetLeaderboard(request: NextRequest) {
  return handleApiError(async () => {
    const url = new URL(request.url);
    const parsed = leaderboardQuerySchema.parse({
      packageId: url.searchParams.get("packageId"),
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const entries = await getPackageLeaderboard(parsed.packageId, parsed.limit);
    return jsonOk(entries);
  });
}
