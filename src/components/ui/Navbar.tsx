"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { useGuestScoreHandoff } from "@/features/auth/hooks/useGuestScoreHandoff";
import { buttonClasses } from "./Button";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Papan Peringkat" },
  { href: "/aturan-bkn", label: "Aturan BKN" },
] as const;

function getDisplayLabel(
  profileName: string | undefined,
  metadata: Record<string, unknown> | undefined,
  email: string | undefined,
): string {
  const source =
    (profileName && profileName.trim().length > 0 ? profileName : null) ??
    (typeof metadata?.full_name === "string" ? metadata.full_name : null) ??
    (typeof metadata?.name === "string" ? metadata.name : null);

  if (source && source.trim().length > 0) {
    return source.trim().split(" ")[0] || source.trim();
  }
  if (email && email.includes("@")) {
    return email.split("@")[0] ?? "Peserta";
  }
  return "Peserta";
}

function getInitials(label: string): string {
  return label.slice(0, 2).toUpperCase();
}

function BottomNavIcon({
  name,
  active,
}: {
  name: "home" | "leaderboard" | "aturan" | "history" | "profile";
  active: boolean;
}) {
  const stroke = active ? "#26660B" : "#575650";

  if (name === "home") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M2.5 8.5L9 2.5L15.5 8.5M4.5 7.5V15H13.5V7.5"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "leaderboard") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M3.5 14.5V9.5M9 14.5V3.5M14.5 14.5V6.5"
          stroke={stroke}
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "aturan") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect
          x="3.5"
          y="2.5"
          width="11"
          height="13"
          rx="2"
          stroke={stroke}
          strokeWidth="1.75"
        />
        <path
          d="M6.5 6.5H11.5M6.5 10H11.5"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "history") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="6.25" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M9 5.75V9.25L11.25 11"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6.25" r="3" stroke={stroke} strokeWidth="1.75" />
      <path
        d="M3.5 15C3.5 12.2 5.9 10.5 9 10.5C12.1 10.5 14.5 12.2 14.5 15"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuthUser();
  const { notice, dismissNotice } = useGuestScoreHandoff(user);

  const navItems = user
    ? [...PUBLIC_NAV_ITEMS, { href: "/history", label: "Riwayat" }]
    : [...PUBLIC_NAV_ITEMS];

  const isExamRoute = pathname.startsWith("/exam/");
  const isProfileActive = pathname.startsWith("/profile");

  const displayLabel = user
    ? getDisplayLabel(profile?.display_name, user.user_metadata, user.email)
    : "";

  const avatarUrl =
    profile?.avatar_url ??
    (typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null);

  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  async function handleSignOut() {
    await signOut();
    if (pathname.startsWith("/history") || pathname.startsWith("/profile")) {
      router.push("/");
    }
    router.refresh();
  }

  const mobileTabs = [
    { href: "/", label: "Home", icon: "home" as const },
    { href: "/leaderboard", label: "Peringkat", icon: "leaderboard" as const },
    { href: "/aturan-bkn", label: "Aturan", icon: "aturan" as const },
    { href: "/history", label: "Riwayat", icon: "history" as const },
    {
      href: user ? "/profile" : "/login",
      label: user ? "Profil" : "Masuk",
      icon: "profile" as const,
    },
  ];

  return (
    <>
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
                <Link
                  href="/profile"
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-2.5 py-1 transition-colors ${
                    isProfileActive
                      ? "border-accent bg-accent-soft text-accent-dark"
                      : "border-transparent text-ink hover:border-border-subtle hover:bg-card"
                  }`}
                >
                  <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full border-[1.5px] border-accent bg-accent-soft">
                    {avatarUrl && !avatarFailed ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={avatarUrl}
                        alt={displayLabel}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-mono text-xs font-bold text-accent-dark">
                        {getInitials(displayLabel)}
                      </span>
                    )}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:inline">
                    {displayLabel}
                  </span>
                </Link>

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

        {/* Global Guest-to-Auth Handoff Success Notification */}
        {notice && (
          <div
            role="status"
            className="border-y border-accent bg-accent-soft px-4 py-2.5 text-xs text-accent-dark sm:px-8 sm:text-sm"
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

      {/* Mobile Bottom Navigation (otomatis tersembunyi di ruang ujian /exam/*) */}
      {!isExamRoute && (
        <nav
          aria-label="Navigasi bawah mobile"
          className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-ink bg-card/95 backdrop-blur-sm md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 px-1.5 py-1.5">
            {mobileTabs.map((tab) => {
              const isActive =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[12px] px-1 text-[11px] transition-colors ${
                    isActive
                      ? "bg-accent-soft font-bold text-accent-dark"
                      : "font-medium text-ink-secondary hover:text-ink"
                  }`}
                >
                  <BottomNavIcon name={tab.icon} active={isActive} />
                  <span className="truncate">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
