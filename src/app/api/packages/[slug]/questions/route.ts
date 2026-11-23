import type { NextRequest } from "next/server";
import { handleGetPackageQuestions } from "@/modules/questions/questions.controller";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  return handleGetPackageQuestions(slug);
}
