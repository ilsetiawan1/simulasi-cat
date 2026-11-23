"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { useGuestScoreHandoff } from "@/features/auth/hooks/useGuestScoreHandoff";
import { buttonClasses } from "./Button";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Papan Peringkat" },
  { href: "/aturan-bkn", label: "Aturan BKN" },
] as const;

function getDisplayLabel(
  metadata: Record<string, unknown> | undefined,
  email: string | undefined,
): string {
  const fullName = metadata?.full_name ?? metadata?.name;
  if (typeof fullName === "string" && fullName.trim().length > 0) {
    const firstPart = fullName.trim().split(" ")[0];
    return firstPart || fullName.trim();
  }
  if (email && email.includes("@")) {
    return email.split("@")[0] ?? "Peserta";
  }
  return "Peserta";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuthUser();
  const { notice, dismissNotice } = useGuestScoreHandoff(user);

  const navItems = user
    ? [...PUBLIC_NAV_ITEMS, { href: "/history", label: "Riwayat" }]
    : [...PUBLIC_NAV_ITEMS];

  async function handleSignOut() {
    await signOut();
    if (pathname.startsWith("/history")) {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <header className="w-full bg-paper">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-8 lg:h-[84px] lg:px-12">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-[-0.04em] text-ink"
        >
          simcat
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-ink"
                    : "font-medium text-ink-secondary hover:text-ink"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {loading ? (
            <span className="inline-block h-[44px] w-[104px] rounded-full border-[1.5px] border-border-subtle bg-pill/60" />
          ) : user ? (
            <>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink-secondary sm:inline">
                {getDisplayLabel(user.user_metadata, user.email)}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className={buttonClasses("outline", "pill", "bg-paper px-5")}
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonClasses("outline", "pill", "min-w-[104px] bg-paper px-6")}
            >
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Mobile secondary nav strip (discoverable, tap targets >= 44px) */}
      <nav
        aria-label="Navigasi mobile"
        className="flex flex-wrap items-center justify-center gap-1 border-y border-border-subtle px-3 py-1 md:hidden"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[44px] items-center px-2.5 text-xs transition-colors ${
                isActive
                  ? "font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
                  : "font-medium text-ink-secondary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Global Guest-to-Auth Handoff Success Notification */}
      {notice && (
        <div
          role="status"
          className="border-b border-accent bg-accent-soft px-4 py-2.5 text-xs text-accent-dark sm:px-8 sm:text-sm"
        >
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span>
                Skor tryout kamu (total{" "}
                <strong className="font-mono tabular-nums">{notice.totalScore}</strong>) berhasil
                disimpan ke Papan Peringkat.
              </span>
              <Link
                href="/leaderboard"
                className="font-semibold underline decoration-accent-dark underline-offset-2"
              >
                Lihat Peringkat →
              </Link>
            </div>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Tutup notifikasi"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold text-accent-dark hover:bg-accent-highlight"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
