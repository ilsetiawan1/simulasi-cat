import type { NextRequest } from "next/server";
import { handleGetLeaderboard } from "@/modules/scores/scores.controller";

export async function GET(request: NextRequest) {
  return handleGetLeaderboard(request);
}
