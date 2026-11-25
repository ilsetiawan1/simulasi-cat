"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import {
  Button,
  EmptyState,
  SelectionHighlight,
  TactileCard,
  buttonClasses,
} from "@/components/ui";
import { fetchMyScoreHistory } from "@/features/exam-result";
import type { ProfileRow } from "@/lib/supabase/types";
import {
  PRESET_AVATARS,
  fetchMyProfile,
  updateMyProfileRequest,
  uploadAvatarToStorage,
} from "../api/profile.api";
import { notifyProfileUpdated, useAuthUser } from "../hooks/useAuthUser";

const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Nama tampilan minimal 2 karakter.")
  .max(60, "Nama tampilan maksimal 60 karakter.");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  if (parts.length === 0) return "PS";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getGoogleAvatarFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const candidate = metadata?.avatar_url ?? metadata?.picture;
  if (typeof candidate === "string" && candidate.startsWith("https://")) {
    return candidate;
  }
  return null;
}

export function ProfileView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading: authLoading, signOut } = useAuthUser();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  const [totalTryouts, setTotalTryouts] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewAvatar = pendingPreviewUrl ?? draftAvatarUrl;

  useEffect(() => {
    setAvatarFailed(false);
  }, [previewAvatar]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [profileRes, historyRes] = await Promise.all([
          fetchMyProfile(),
          fetchMyScoreHistory(30),
        ]);

        if (!active) return;

        if (profileRes.status === "unauthorized") {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setProfile(profileRes.profile);
        setDisplayName(profileRes.profile.display_name);
        setDraftAvatarUrl(profileRes.profile.avatar_url);

        if (historyRes.status === "ok") {
          setTotalTryouts(historyRes.items.length);
          const highest = historyRes.items.reduce(
            (max, item) => Math.max(max, item.total_score),
            0,
          );
          setBestScore(highest);
        }

        setLoading(false);
      } catch (err) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : "Gagal memuat halaman profil.",
        );
        setLoading(false);
      }
    }

    loadAll();
    return () => {
      active = false;
    };
  }, []);

  function clearPendingUpload() {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingFile(null);
    setPendingPreviewUrl(null);
  }

  function handleSelectPresetOrGoogle(nextUrl: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    clearPendingUpload();
    setDraftAvatarUrl(nextUrl);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage("Format foto harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErrorMessage("Ukuran foto maksimal 2 MB.");
      return;
    }

    clearPendingUpload();
    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreviewUrl(objectUrl);
  }

  function handleCancelChanges() {
    if (!profile) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    clearPendingUpload();
    setDisplayName(profile.display_name);
    setDraftAvatarUrl(profile.avatar_url);
  }

  async function handleSaveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !user) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedName = displayNameSchema.safeParse(displayName);
    if (!parsedName.success) {
      setErrorMessage(parsedName.error.issues[0]?.message ?? "Nama tampilan tidak valid.");
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = draftAvatarUrl;

      if (pendingFile) {
        finalAvatarUrl = await uploadAvatarToStorage(user.id, pendingFile);
      }

      const updated = await updateMyProfileRequest({
        displayName: parsedName.data,
        avatarUrl: finalAvatarUrl,
      });

      clearPendingUpload();
      setProfile(updated);
      setDisplayName(updated.display_name);
      setDraftAvatarUrl(updated.avatar_url);
      notifyProfileUpdated(updated);
      setSuccessMessage("Perubahan profil berhasil disimpan.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal menyimpan perubahan profil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (loading || authLoading) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12">
        <TactileCard className="p-8 text-center">
          <p className="font-mono text-sm font-semibold text-ink-secondary">
            Memuat profil akun...
          </p>
        </TactileCard>
      </main>
    );
  }

  if (unauthorized || !profile || !user) {
    return (
      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-8">
        <EmptyState
          title="Masuk untuk mengelola profil"
          description="Atur nama tampilan, avatar Papan Peringkat, dan pantau ringkasan latihanmu setelah masuk."
          action={
            <Link
              href="/login?next=/profile"
              className={buttonClasses("primary", "rounded")}
            >
              Masuk Sekarang →
            </Link>
          }
        />
      </main>
    );
  }

  const googleAvatarUrl = getGoogleAvatarFromMetadata(user.user_metadata);
  const isGoogleProvider =
    user.app_metadata?.provider === "google" ||
    (Array.isArray(user.app_metadata?.providers) &&
      user.app_metadata.providers.includes("google"));

  const hasChanges =
    displayName.trim() !== profile.display_name ||
    draftAvatarUrl !== profile.avatar_url ||
    pendingFile !== null;

  return (
    <main className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-8 sm:px-8 lg:px-12">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Profil <SelectionHighlight>Akun</SelectionHighlight>
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Atur nama tampilan untuk Papan Peringkat dan pantau ringkasan latihanmu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Kiri: Card Identitas & Ringkasan (Live Preview) */}
        <TactileCard className="h-fit p-6">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-accent bg-accent-soft">
              {previewAvatar && !avatarFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewAvatar}
                  alt={displayName || profile.display_name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-mono text-xl font-bold text-accent-dark">
                  {getInitials(displayName || profile.display_name)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-ink">
                {displayName.trim() || profile.display_name}
              </h2>
              <p className="truncate text-xs text-ink-secondary sm:text-sm">
                {user.email}
              </p>
              <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] leading-snug sm:mt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2.5 sm:text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-accent-dark">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{isGoogleProvider ? "Terhubung dengan Google" : "Akun Email"}</span>
                </span>
                <span className="text-ink-muted">
                  Bergabung {formatMonthYear(profile.created_at)}
                </span>
              </div>
            </div>
          </div>

          <hr className="my-5 border-border-subtle" />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border-[1.5px] border-ink bg-pure p-3.5">
              <p className="text-xs font-medium text-ink-muted">Total Tryout</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink">
                {totalTryouts}
              </p>
            </div>
            <div className="rounded-[14px] border-[1.5px] border-accent bg-accent-soft p-3.5">
              <p className="text-xs font-medium text-ink-secondary">Skor Tertinggi</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-accent-dark">
                {bestScore}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/history"
              className={buttonClasses("outline", "rounded", "w-full")}
            >
              Lihat Riwayat Tryout →
            </Link>
          </div>
        </TactileCard>

        {/* Kanan: Card Pengaturan Profil & Avatar Picker */}
        <TactileCard className="p-6 sm:p-8">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-[12px] border border-danger-border bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-[12px] border border-accent bg-accent-soft px-4 py-3 text-sm font-medium text-accent-dark"
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSaveChanges} noValidate>
            {/* Section 1: Foto Profil & Avatar */}
            <section aria-labelledby="avatar-heading">
              <h2 id="avatar-heading" className="font-mono text-base font-bold text-ink">
                Foto Profil &amp; Avatar
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Pilih foto atau avatar di bawah untuk pratinjau, lalu klik{" "}
                <span className="font-semibold text-ink">Simpan Perubahan</span> untuk menerapkannya.
              </p>

              <div
                className={`mt-4 grid gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 ${
                  googleAvatarUrl ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 text-xs sm:w-auto sm:px-5 sm:text-sm"
                >
                  Upload Foto
                </Button>

                {googleAvatarUrl && (
                  <Button
                    variant="subtle"
                    disabled={saving}
                    onClick={() => handleSelectPresetOrGoogle(googleAvatarUrl)}
                    className="w-full px-3 text-xs sm:w-auto sm:px-5 sm:text-sm"
                  >
                    Gunakan Foto Google
                  </Button>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Format JPG, PNG, atau WebP (maks. 2 MB)
              </p>

              <div className="mt-5">
                <p className="text-xs font-semibold text-ink-secondary">
                  Atau pilih avatar bawaan:
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = !pendingFile && draftAvatarUrl === preset.path;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={saving}
                        onClick={() => handleSelectPresetOrGoogle(preset.path)}
                        aria-label={preset.label}
                        aria-pressed={isSelected}
                        className={`h-13 w-13 overflow-hidden rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
                          isSelected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-border-subtle hover:border-ink"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.path}
                          alt={preset.label}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <hr className="my-6 border-border-subtle" />

            {/* Section 2: Informasi Publik */}
            <div className="space-y-4">
              <h2 className="font-mono text-base font-bold text-ink">
                Informasi Publik
              </h2>

              <div>
                <label
                  htmlFor="profile-display-name"
                  className="block text-sm font-medium text-ink"
                >
                  Nama Tampilan
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama panggilan untuk Papan Peringkat"
                  className="mt-1.5 min-h-[44px] w-full rounded-[12px] border-[1.5px] border-ink bg-pure px-3.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-medium text-ink"
                >
                  Email Akun
                </label>
                <input
                  id="profile-email"
                  type="email"
                  readOnly
                  disabled
                  value={user.email ?? ""}
                  className="mt-1.5 min-h-[44px] w-full cursor-not-allowed rounded-[12px] border-[1.5px] border-border-subtle bg-pill px-3.5 text-sm text-ink-secondary"
                />
                <p className="mt-1 text-xs text-ink-muted">
                  {isGoogleProvider
                    ? "Email dikelola melalui akun Google dan tidak dapat diubah di sini."
                    : "Email utama akun tidak dapat diubah secara langsung."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!hasChanges || saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                {hasChanges && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={handleCancelChanges}
                  >
                    Batal Perubahan
                  </Button>
                )}
              </div>
            </div>
          </form>

          <hr className="my-6 border-border-subtle" />

          {/* Section 3: Sesi Perangkat */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-ink">Sesi Perangkat</h2>
              <p className="mt-0.5 text-xs text-ink-secondary">
                Keluar dari perangkat ini tanpa menghapus riwayat skormu.
              </p>
            </div>
            <Button variant="danger" onClick={handleSignOut}>
              Keluar dari Akun
            </Button>
          </div>
        </TactileCard>
      </div>
    </main>
  );
}
