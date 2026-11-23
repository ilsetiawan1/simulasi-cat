import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AppError } from "@/utils/http-response";

/**
 * Verifikasi identitas pengguna di server menggunakan supabase.auth.getUser()
 * (bukan getSession) sesuai standar security-audit & Supabase SSR.
 */
export async function requireAuthUser(supabase: SupabaseClient): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Silakan masuk terlebih dahulu untuk mengakses fitur ini.",
    );
  }
  return data.user;
}
