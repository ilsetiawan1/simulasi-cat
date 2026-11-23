import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t-[1.5px] border-ink bg-pill">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-md">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-[-0.04em] text-ink"
            >
              simcat
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Aplikasi latihan simulasi CAT CPNS gratis untuk SKD &amp; SKB. Mengacu
              ambang batas KepmenPANRB No. 321 Tahun 2024.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
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
                    Latihan Cepat Subtes
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

        <div className="mt-10 border-t border-border-subtle pt-6 text-xs text-ink-muted">
          simulasi-cat &bull; Gratis 100% tanpa biaya langganan
        </div>
      </div>
    </footer>
  );
}
