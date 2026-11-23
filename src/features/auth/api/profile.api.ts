import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";

export const PRESET_AVATARS = [
  { id: "preset-1", label: "Avatar Topi Kuning", path: "/avatars/preset-1.svg" },
  { id: "preset-2", label: "Avatar Topi Biru", path: "/avatars/preset-2.svg" },
  { id: "preset-3", label: "Avatar Pastel Pink", path: "/avatars/preset-3.svg" },
  { id: "preset-4", label: "Avatar Kacamata Biru", path: "/avatars/preset-4.svg" },
  { id: "preset-5", label: "Avatar Kacamata Hijau", path: "/avatars/preset-5.svg" },
] as const;

const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export type FetchProfileOutcome =
  | { status: "ok"; profile: ProfileRow }
  | { status: "unauthorized" };

export async function fetchMyProfile(): Promise<FetchProfileOutcome> {
  const response = await fetch("/api/profile", { cache: "no-store" });
  if (response.status === 401) {
    return { status: "unauthorized" };
  }

  const body = (await response.json()) as {
    data?: ProfileRow;
    error?: { message?: string };
  };

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Gagal memuat data profil.");
  }

  return { status: "ok", profile: body.data };
}

export async function updateMyProfileRequest(payload: {
  displayName?: string;
  avatarUrl?: string | null;
}): Promise<ProfileRow> {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as {
    data?: ProfileRow;
    error?: { message?: string };
  };

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Gagal memperbarui profil.");
  }

  return body.data;
}

export async function uploadAvatarToStorage(
  userId: string,
  file: File,
): Promise<string> {
  const ext = ALLOWED_MIME_EXT[file.type];
  if (!ext) {
    throw new Error("Format foto harus JPG, PNG, atau WebP.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Ukuran foto maksimal 2 MB.");
  }

  const supabase = createSupabaseBrowserClient();
  const objectPath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(objectPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error("Gagal mengunggah foto ke penyimpanan. Silakan coba lagi.");
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
  return `${data.publicUrl}?v=${Date.now()}`;
}
