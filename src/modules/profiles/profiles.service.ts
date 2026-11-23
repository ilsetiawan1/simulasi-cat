import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";
import { requireAuthUser } from "@/middlewares/auth-guard";
import { AppError } from "@/utils/http-response";
import { findProfileById, updateProfileDisplayName } from "./profiles.repository";

export async function getMyProfile(client?: SupabaseClient): Promise<ProfileRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);
  const profile = await findProfileById(supabase, user.id);

  if (!profile) {
    throw new AppError(404, "PROFILE_NOT_FOUND", "Profil pengguna tidak ditemukan.");
  }

  return profile;
}

export async function updateMyDisplayName(
  displayName: string,
  client?: SupabaseClient,
): Promise<ProfileRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);
  return updateProfileDisplayName(supabase, user.id, displayName.trim());
}
