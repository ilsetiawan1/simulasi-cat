import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/lib/supabase/types";

const PROFILE_COLUMNS = "id, display_name, avatar_url, created_at, updated_at";

export async function findProfileById(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProfileRow | null) ?? null;
}

export async function updateProfileDisplayName(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}
