import Link from "next/link";
import { InstallAppButton } from "./InstallAppButton";

export function Footer() {
  return (
    <footer className="mt-20 border-t-[1.5px] border-ink bg-pill pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-md">
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
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Aplikasi latihan simulasi CAT CPNS gratis untuk SKD &amp; SKB. Mengacu
              ambang batas KepmenPANRB No. 321 Tahun 2024.
            </p>
            <div className="mt-4">
              <InstallAppButton />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:flex sm:flex-row sm:gap-16">
            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-ink">
                NAVIGASI
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm font-medium text-ink-secondary">
                <li>
                  <Link href="/" className="hover:text-ink">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-ink">
                    Papan Peringkat
                  </Link>
                </li>
                <li>
                  <Link href="/aturan-bkn" className="hover:text-ink">
                    Aturan BKN
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-ink">
                MODE UJIAN
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm font-medium text-ink-secondary">
                <li>
                  <Link href="/#katalog" className="hover:text-ink">
                    Simulasi SKD Penuh
                  </Link>
                </li>
                <li>
                  <Link href="/#katalog" className="hover:text-ink">
                    Latihan Subtes
                  </Link>
                </li>
                <li>
                  <Link href="/#katalog" className="hover:text-ink">
                    Simulasi SKB Jabatan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border-subtle pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-4">
            <span className="font-medium text-ink-secondary">simulasi-cat</span>
            <span>Gratis 100% tanpa biaya langganan</span>
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
            <Link href="/privacy" className="hover:text-ink">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
