"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "./Button";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Papan Peringkat" },
  { href: "/aturan-bkn", label: "Aturan BKN" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-paper">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-8 lg:h-[84px] lg:px-12">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-[-0.04em] text-ink"
        >
          simcat
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
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

        <Link
          href="/login"
          className={buttonClasses("outline", "pill", "min-w-[104px] bg-paper px-6")}
        >
          Masuk
        </Link>
      </div>

      {/* Mobile secondary nav strip (discoverable, tap targets >= 44px) */}
      <nav
        aria-label="Navigasi mobile"
        className="flex items-center justify-center gap-2 border-y border-border-subtle px-4 py-1 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[44px] items-center px-3 text-xs transition-colors ${
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
    </header>
  );
}
