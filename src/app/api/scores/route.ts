import type { NextRequest } from "next/server";
import { handleSubmitScore } from "@/modules/scores/scores.controller";

export async function POST(request: NextRequest) {
  return handleSubmitScore(request);
}
