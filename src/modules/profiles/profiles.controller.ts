import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/middlewares/error-handler";
import { jsonOk } from "@/utils/http-response";
import { getMyProfile, updateMyDisplayName } from "./profiles.service";

const updateProfileBodySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama tampilan minimal 2 karakter.")
    .max(60, "Nama tampilan maksimal 60 karakter."),
});

export async function handleGetProfile() {
  return handleApiError(async () => {
    const profile = await getMyProfile();
    return jsonOk(profile);
  });
}

export async function handleUpdateProfile(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const { displayName } = updateProfileBodySchema.parse(body);

    const updated = await updateMyDisplayName(displayName);
    return jsonOk(updated);
  });
}
