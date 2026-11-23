import type { NextRequest } from "next/server";
import { handleGetPackages } from "@/modules/packages/packages.controller";

export async function GET(request: NextRequest) {
  return handleGetPackages(request);
}
