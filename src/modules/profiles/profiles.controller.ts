import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/middlewares/error-handler";
import { jsonOk } from "@/utils/http-response";
import { getMyProfile, updateMyProfile } from "./profiles.service";

export const PRESET_AVATAR_PATHS = [
  "/avatars/preset-1.svg",
  "/avatars/preset-2.svg",
  "/avatars/preset-3.svg",
  "/avatars/preset-4.svg",
  "/avatars/preset-5.svg",
] as const;

function isSafeAvatarUrl(value: string): boolean {
  if ((PRESET_AVATAR_PATHS as readonly string[]).includes(value)) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const updateProfileBodySchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Nama tampilan minimal 2 karakter.")
      .max(60, "Nama tampilan maksimal 60 karakter.")
      .optional(),
    avatarUrl: z
      .string()
      .trim()
      .max(512, "URL avatar terlalu panjang.")
      .refine(isSafeAvatarUrl, "URL avatar harus berupa HTTPS atau preset bawaan.")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.displayName !== undefined || data.avatarUrl !== undefined,
    "Minimal satu field (displayName atau avatarUrl) harus diisi.",
  );

export async function handleGetProfile() {
  return handleApiError(async () => {
    const profile = await getMyProfile();
    return jsonOk(profile);
  });
}

export async function handleUpdateProfile(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const parsed = updateProfileBodySchema.parse(body);

    const updated = await updateMyProfile(parsed);
    return jsonOk(updated);
  });
}
