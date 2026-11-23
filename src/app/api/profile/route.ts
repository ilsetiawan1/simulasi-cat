import type { NextRequest } from "next/server";
import { handleGetProfile, handleUpdateProfile } from "@/modules/profiles/profiles.controller";

export async function GET() {
  return handleGetProfile();
}

export async function PATCH(request: NextRequest) {
  return handleUpdateProfile(request);
}
