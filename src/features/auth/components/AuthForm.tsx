"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button, SelectionHighlight, TactileCard } from "@/components/ui";
import { loadPendingGuestResult } from "@/lib/storage/exam-storage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/supabase/redirect";

interface AuthFormProps {
  mode: "login" | "register";
}

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama tampilan minimal 2 karakter.")
    .max(60, "Nama tampilan maksimal 60 karakter."),
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

function GoogleLogoSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeRedirectPath(searchParams.get("next"));
  const callbackError = searchParams.get("error");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasPendingScore, setHasPendingScore] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Autentikasi Google tidak selesai. Silakan coba lagi."
      : null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasPendingScore(loadPendingGuestResult() !== null);
  }, []);

  async function handleGoogleAuth() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setErrorMessage("Gagal memulai login Google. Silakan coba kembali.");
        setGoogleLoading(false);
      }
    } catch {
      setErrorMessage("Terjadi kendala koneksi saat menghubungi Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "login") {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setErrorMessage(parsed.error.issues[0]?.message ?? "Periksa kembali isian kamu.");
        return;
      }

      setSubmitting(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (error) {
          setErrorMessage("Email atau kata sandi tidak sesuai.");
          setSubmitting(false);
          return;
        }

        router.push(nextPath);
        router.refresh();
      } catch {
        setErrorMessage("Gagal masuk ke akun. Coba lagi beberapa saat.");
        setSubmitting(false);
      }
      return;
    }

    const parsed = registerSchema.safeParse({ displayName, email, password });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Periksa kembali isian kamu.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.displayName },
          emailRedirectTo,
        },
      });

      if (error) {
        setErrorMessage(
          error.message.includes("already registered")
            ? "Email ini sudah terdaftar. Silakan masuk di halaman Login."
            : "Gagal membuat akun baru. Periksa data lalu coba lagi.",
        );
        setSubmitting(false);
        return;
      }

      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Akun berhasil dibuat. Periksa kotak masuk email kamu untuk konfirmasi, lalu masuk kembali.",
      );
      setSubmitting(false);
    } catch {
      setErrorMessage("Gagal mendaftarkan akun. Coba lagi beberapa saat.");
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";
  const switchHref =
    nextPath !== "/"
      ? `${isLogin ? "/register" : "/login"}?next=${encodeURIComponent(nextPath)}`
      : isLogin
        ? "/register"
        : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* Auth Navbar */}
      <header className="w-full bg-paper">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-8 lg:h-[84px] lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-[-0.04em] text-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span>simcat</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink-secondary hover:text-ink"
          >
            ← Kembali ke Home
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-4 py-6 sm:py-10">
        <TactileCard className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
            {isLogin ? "Masuk ke " : "Buat Akun "}
            <SelectionHighlight>simcat</SelectionHighlight>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {isLogin
              ? "Simpan skor tryout ke Papan Peringkat dan pantau riwayat latihanmu."
              : "Gratis 100% untuk menyimpan riwayat tryout & masuk Papan Peringkat."}
          </p>

          {hasPendingScore && (
            <div className="mt-4 rounded-[12px] border border-accent bg-accent-soft px-3.5 py-2.5 text-xs font-medium text-accent-dark">
              Skor simulasi terakhirmu siap disimpan otomatis ke Papan Peringkat setelah berhasil masuk.
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-[12px] border border-danger-border bg-danger-bg px-3.5 py-2.5 text-xs font-medium text-danger-text"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mt-4 rounded-[12px] border border-accent bg-accent-soft px-3.5 py-2.5 text-xs font-medium text-accent-dark"
            >
              {successMessage}
            </div>
          )}

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={googleLoading || submitting}
            className="mt-5 w-full min-h-[46px]"
          >
            <GoogleLogoSvg />
            <span>
              {googleLoading
                ? "Mengarahkan ke Google..."
                : isLogin
                  ? "Masuk dengan Google"
                  : "Daftar dengan Google"}
            </span>
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            <span>atau dengan email</span>
            <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div>
                <label
                  htmlFor="auth-display-name"
                  className="block text-sm font-medium text-ink"
                >
                  Nama Tampilan
                </label>
                <input
                  id="auth-display-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama panggilan untuk Papan Peringkat"
                  className="mt-1.5 min-h-[44px] w-full rounded-[12px] border-[1.5px] border-ink bg-pure px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-ink"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1.5 min-h-[44px] w-full rounded-[12px] border-[1.5px] border-ink bg-pure px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-ink"
              >
                Kata Sandi
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Masukkan kata sandi" : "Minimal 8 karakter"}
                className="mt-1.5 min-h-[44px] w-full rounded-[12px] border-[1.5px] border-ink bg-pure px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting || googleLoading}
              className="mt-2 w-full min-h-[48px]"
            >
              {submitting
                ? "Memproses..."
                : isLogin
                  ? "Masuk →"
                  : "Buat Akun →"}
            </Button>
          </form>

          {/* Switch Link */}
          <p className="mt-5 text-center text-sm text-ink-secondary">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <Link
              href={switchHref}
              className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
            >
              {isLogin ? "Daftar sekarang" : "Masuk di sini"}
            </Link>
          </p>

          <hr className="my-5 border-border-subtle" />

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-accent-dark hover:underline"
            >
              {isLogin
                ? "Lanjutkan sebagai Guest tanpa login →"
                : "Lanjutkan sebagai Guest tanpa daftar →"}
            </Link>
          </div>
        </TactileCard>
      </main>
    </div>
  );
}
