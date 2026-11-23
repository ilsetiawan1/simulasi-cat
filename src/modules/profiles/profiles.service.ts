import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";
import { requireAuthUser } from "@/middlewares/auth-guard";
import { AppError } from "@/utils/http-response";
import {
  findProfileById,
  updateProfileRow,
  type UpdateProfileRowInput,
} from "./profiles.repository";

export interface UpdateMyProfileInput {
  displayName?: string;
  avatarUrl?: string | null;
}

export async function getMyProfile(client?: SupabaseClient): Promise<ProfileRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);
  const profile = await findProfileById(supabase, user.id);

  if (!profile) {
    throw new AppError(404, "PROFILE_NOT_FOUND", "Profil pengguna tidak ditemukan.");
  }

  return profile;
}

export async function updateMyProfile(
  input: UpdateMyProfileInput,
  client?: SupabaseClient,
): Promise<ProfileRow> {
  const supabase = client ?? (await createSupabaseServerClient());
  const user = await requireAuthUser(supabase);

  const changes: UpdateProfileRowInput = {};
  if (input.displayName !== undefined) {
    changes.display_name = input.displayName.trim();
  }
  if (input.avatarUrl !== undefined) {
    changes.avatar_url = input.avatarUrl;
  }

  return updateProfileRow(supabase, user.id, changes);
}
