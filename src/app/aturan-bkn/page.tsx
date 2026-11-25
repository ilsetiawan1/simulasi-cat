import type { Metadata } from "next";
import Link from "next/link";
import {
  Footer,
  Navbar,
  PageReveal,
  SelectionHighlight,
  TactileCard,
  buttonClasses,
} from "@/components/ui";
import {
  SKD_DEFAULT_DURATION_MINUTES,
  SKD_MAX_SCORE,
  SKD_PASSING_GRADE,
  SKD_QUESTION_COUNTS,
  SKD_TOTAL_QUESTIONS,
} from "@/constants/passing-grade";

export const metadata: Metadata = {
  title: "Aturan & Passing Grade CAT CPNS BKN",
  description:
    "Panduan lengkap ambang batas (passing grade) SKD CPNS KepmenPANRB No. 321 Tahun 2024 (TWK 65, TIU 80, TKP 166), bobot SKB, dan aturan tie-breaker BKN.",
  alternates: { canonical: "/aturan-bkn" },
  openGraph: {
    title: "Aturan & Passing Grade CAT CPNS BKN | simcat",
    description:
      "Acuan resmi passing grade SKD CPNS (TWK 65, TIU 80, TKP 166), penilaian SKB, dan urutan tie-breaker BKN.",
    url: "/aturan-bkn",
  },
};

const SUBTEST_ROWS = [
  {
    name: "TWK — Tes Wawasan Kebangsaan",
    block: "No. 1 - 30",
    count: SKD_QUESTION_COUNTS.TWK,
    scoring: "Benar: +5, Salah/Kosong: 0",
    max: SKD_MAX_SCORE.TWK,
    pg: SKD_PASSING_GRADE.TWK,
  },
  {
    name: "TIU — Tes Intelegensia Umum",
    block: "No. 31 - 65",
    count: SKD_QUESTION_COUNTS.TIU,
    scoring: "Benar: +5, Salah/Kosong: 0",
    max: SKD_MAX_SCORE.TIU,
    pg: SKD_PASSING_GRADE.TIU,
  },
  {
    name: "TKP — Tes Karakteristik Pribadi",
    block: "No. 66 - 110",
    count: SKD_QUESTION_COUNTS.TKP,
    scoring: "Skala opsi: 1 s.d. 5, Kosong: 0",
    max: SKD_MAX_SCORE.TKP,
    pg: SKD_PASSING_GRADE.TKP,
  },
] as const;

export default function AturanBknPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageReveal className="mx-auto max-w-[1280px] px-4 pt-8 pb-16 sm:px-8 lg:px-12 lg:pt-12">
          <div data-reveal>
            <h1 className="font-mono text-2xl leading-snug tracking-[-0.02em] text-ink sm:text-3xl lg:text-4xl">
              Aturan &amp; <SelectionHighlight>Passing Grade</SelectionHighlight> CAT BKN
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-ink-secondary">
              Acuan resmi KepmenPANRB No. 321 Tahun 2024 yang diterapkan pada seluruh
              simulasi SKD ({SKD_TOTAL_QUESTIONS} soal, {SKD_DEFAULT_DURATION_MINUTES} menit)
              dan SKB di simcat.
            </p>
          </div>

          {/* Passing Grade Table — Desktop & Tablet */}
          <div data-reveal>
            <TactileCard className="mt-8 hidden overflow-hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-pill font-mono text-xs font-bold text-ink">
                  <th className="px-6 py-4">SUBTES SKD (URUTAN BLOK)</th>
                  <th className="px-4 py-4">JUMLAH SOAL</th>
                  <th className="px-4 py-4">BOBOT PENILAIAN</th>
                  <th className="px-4 py-4 text-right">SKOR MAKS</th>
                  <th className="px-6 py-4 text-right text-accent-dark">PASSING GRADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm">
                {SUBTEST_ROWS.map((row) => (
                  <tr key={row.name}>
                    <td className="px-6 py-4 font-semibold text-ink">
                      {row.name}{" "}
                      <span className="font-normal text-ink-secondary">({row.block})</span>
                    </td>
                    <td className="px-4 py-4 font-mono tabular-nums text-ink">
                      {row.count} soal
                    </td>
                    <td className="px-4 py-4 text-ink-secondary">{row.scoring}</td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-ink">
                      {row.max}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-base font-bold tabular-nums text-accent-dark">
                      {row.pg}
                    </td>
                  </tr>
                ))}
                <tr className="bg-accent-soft font-semibold">
                  <td className="px-6 py-5 text-ink">
                    TOTAL SKD PENUH (Durasi {SKD_DEFAULT_DURATION_MINUTES} Menit)
                  </td>
                  <td className="px-4 py-5 font-mono tabular-nums text-ink">
                    {SKD_TOTAL_QUESTIONS} soal
                  </td>
                  <td className="px-4 py-5 text-xs text-accent-dark">
                    Lulus jika ketiga subtes memenuhi ambang batas
                  </td>
                  <td className="px-4 py-5 text-right font-mono tabular-nums text-ink">
                    {SKD_MAX_SCORE.TOTAL}
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-lg font-bold tabular-nums text-accent-dark">
                    {SKD_PASSING_GRADE.TOTAL}
                  </td>
                </tr>
              </tbody>
            </table>
          </TactileCard>

          {/* Passing Grade Breakdown — Mobile (zero horizontal overflow) */}
          <TactileCard className="mt-8 overflow-hidden md:hidden" shadow="sm">
            <div className="border-b border-border-subtle bg-pill px-4 py-3 font-mono text-xs font-bold text-accent-dark">
              AMBANG BATAS SKD PENUH
            </div>
            <div className="divide-y divide-border-subtle">
              {SUBTEST_ROWS.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {row.name.split(" — ")[0]} ({row.block})
                    </p>
                    <p className="text-xs text-ink-secondary">
                      {row.count} soal &bull; {row.scoring}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-accent-dark">
                    PG {row.pg} / {row.max}
                  </p>
                </div>
              ))}
              <div className="bg-accent-soft px-4 py-4 font-mono text-xs font-bold text-ink">
                Total Min: {SKD_PASSING_GRADE.TOTAL} / {SKD_MAX_SCORE.TOTAL} (Wajib lulus 3
                subtes)
              </div>
            </div>
          </TactileCard>
          </div>

          {/* Two Rule Cards */}
          <div data-reveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <TactileCard className="p-6">
              <p className="font-mono text-xs font-bold text-accent">
                ATURAN TIE-BREAKER PERINGKAT
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                Penentuan Peringkat Saat Total Skor Sama
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Jika dua peserta memperoleh total skor SKD yang sama pada Papan Peringkat,
                urutan peringkat ditentukan secara berurutan berdasarkan: (1) Total Skor
                SKD, (2) Skor TKP tertinggi, (3) Skor TIU tertinggi, (4) Skor TWK
                tertinggi, dan (5) Waktu Submit Tercepat.
              </p>
            </TactileCard>

            <TactileCard className="p-6">
              <p className="font-mono text-xs font-bold text-accent">
                MEKANISME CAT &amp; SKB
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                Pengacakan Soal, Opsi A-E &amp; Aturan SKB
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Pengacakan Fisher-Yates dilakukan terpisah di dalam blok TWK (1-30), TIU
                (31-65), dan TKP (66-110). Posisi opsi A-E diacak dinamis pada setiap sesi
                kecuali soal ber-flag urutan tetap. Mode SKB menggunakan bobot Benar +5
                dan Salah/Kosong 0.
              </p>
            </TactileCard>
          </div>

          {/* Bottom CTA Banner */}
          <div
            data-reveal
            className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[22px] border-[1.5px] border-ink bg-pill p-6 sm:flex-row sm:items-center sm:px-8"
          >
            <p className="font-mono text-lg text-ink sm:text-xl">
              Siap menguji target passing grade kamu?
            </p>
            <Link
              href="/#katalog"
              className={buttonClasses("primary", "rounded", "w-full sm:w-auto")}
            >
              Mulai Simulasi SKD →
            </Link>
          </div>
        </PageReveal>
      </main>
      <Footer />
    </div>
  );
}
