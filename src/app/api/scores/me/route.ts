import type { NextRequest } from "next/server";
import { handleGetMyScores } from "@/modules/scores/scores.controller";

export async function GET(request: NextRequest) {
  return handleGetMyScores(request);
}
