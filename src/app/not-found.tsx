import Link from "next/link";
import {
  Navbar,
  SelectionHighlight,
  TactileCard,
  buttonClasses,
} from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-14 sm:px-8">
        <TactileCard className="w-full max-w-[600px] px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="flex justify-center">
            <svg
              width="120"
              height="92"
              viewBox="0 0 120 92"
              fill="none"
              aria-hidden="true"
              className="text-ink"
            >
              <path
                d="M26 10H74L94 30V82H26V10Z"
                fill="#EAE8E1"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M74 10V30H94"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M46 44L74 72M74 44L46 72"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mt-6">
            <SelectionHighlight
              showHandles={false}
              className="font-mono text-4xl font-bold sm:text-5xl"
            >
              404
            </SelectionHighlight>
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-ink">
            Halaman tidak ditemukan.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-secondary">
            Tautan yang kamu buka mungkin sudah dipindahkan, salah ketik, atau paket
            tryout sedang tidak aktif.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonClasses("primary", "rounded", "sm:min-w-[200px]")}>
              Kembali ke Home →
            </Link>
            <Link
              href="/leaderboard"
              className={buttonClasses("outline", "rounded", "sm:min-w-[200px]")}
            >
              Lihat Papan Peringkat
            </Link>
          </div>
        </TactileCard>
      </main>
    </div>
  );
}
