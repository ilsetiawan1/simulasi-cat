"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, TactileCard, buttonClasses } from "@/components/ui";
import { SKD_PASSING_GRADE } from "@/constants/passing-grade";
import {
  clearExamSession,
  loadExamSession,
  type ExamSessionState,
} from "@/lib/storage/exam-storage";
import type { ExamCategory, ExamPackageRow } from "@/lib/supabase/types";

interface PackageConfirmViewProps {
  pkg: ExamPackageRow;
}

const CATEGORY_LABELS: Record<ExamCategory, string> = {
  SKD_FULL: "SKD Penuh (TWK • TIU • TKP)",
  MINI_TWK: "Mini Tryout • TWK",
  MINI_TIU: "Mini Tryout • TIU",
  MINI_TKP: "Mini Tryout • TKP",
  SKB: "Seleksi Kompetensi Bidang (SKB)",
};

function formatRemainingMinutes(endTimestamp: number): string {
  const remainingSec = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  return `${mins} menit ${secs} detik`;
}

export function PackageConfirmView({ pkg }: PackageConfirmViewProps) {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<ExamSessionState | null>(null);

  useEffect(() => {
    const saved = loadExamSession(pkg.slug);
    if (saved && saved.endTimestamp > Date.now()) {
      setActiveSession(saved);
    } else if (saved) {
      clearExamSession(pkg.slug);
    }
  }, [pkg.slug]);

  function handleStartFresh() {
    clearExamSession(pkg.slug);
    router.push(`/exam/${pkg.slug}`);
  }

  const pgTwk = pkg.passing_grade_twk ?? SKD_PASSING_GRADE.TWK;
  const pgTiu = pkg.passing_grade_tiu ?? SKD_PASSING_GRADE.TIU;
  const pgTkp = pkg.passing_grade_tkp ?? SKD_PASSING_GRADE.TKP;

  const passingRules: { label: string; value: string }[] = [];
  if (pkg.category === "SKD_FULL") {
    passingRules.push(
      { label: "TWK (Wawasan Kebangsaan)", value: `PG ${pgTwk}` },
      { label: "TIU (Intelegensia Umum)", value: `PG ${pgTiu}` },
      { label: "TKP (Karakteristik Pribadi)", value: `PG ${pgTkp}` },
    );
  } else if (pkg.category === "MINI_TWK") {
    passingRules.push({ label: "TWK (Wawasan Kebangsaan)", value: `PG ${pgTwk}` });
  } else if (pkg.category === "MINI_TIU") {
    passingRules.push({ label: "TIU (Intelegensia Umum)", value: `PG ${pgTiu}` });
  } else if (pkg.category === "MINI_TKP") {
    passingRules.push({ label: "TKP (Karakteristik Pribadi)", value: `PG ${pgTkp}` });
  } else {
    passingRules.push({ label: "Penilaian SKB", value: "Benar +5 • Salah / Kosong 0" });
  }

  const answeredInSession = activeSession
    ? Object.keys(activeSession.answers).length
    : 0;

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink-secondary hover:text-ink"
        >
          ← Kembali ke Katalog Paket
        </Link>
      </div>

      <TactileCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-dark">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <span>{CATEGORY_LABELS[pkg.category]}</span>
        </div>

        <h1 className="mt-3 font-mono text-2xl font-bold text-ink sm:text-3xl">
          {pkg.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          {pkg.description}
        </p>

        {/* Ringkasan Parameter Paket */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border-[1.5px] border-ink bg-pure p-4">
            <p className="text-xs font-medium text-ink-muted">Jumlah Soal</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-ink">
              {pkg.total_questions} Soal
            </p>
          </div>
          <div className="rounded-[14px] border-[1.5px] border-ink bg-pure p-4">
            <p className="text-xs font-medium text-ink-muted">Durasi Ujian</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-ink">
              {pkg.duration_minutes} Menit
            </p>
          </div>
          <div className="rounded-[14px] border-[1.5px] border-ink bg-accent-soft p-4">
            <p className="text-xs font-medium text-ink-secondary">Akses & Auto-Save</p>
            <p className="mt-1 font-mono text-base font-bold text-accent-dark">
              Gratis • Tanpa Login
            </p>
          </div>
        </div>

        {/* Aturan Passing Grade */}
        <div className="mt-6 rounded-[16px] border border-border-subtle bg-pill/70 p-4 sm:p-5">
          <h2 className="font-mono text-sm font-bold text-ink">
            Ambang Batas Kelulusan (KepmenPANRB No. 321 Tahun 2024)
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {passingRules.map((rule) => (
              <div
                key={rule.label}
                className="flex items-center justify-between rounded-[12px] border border-border-subtle bg-pure px-3.5 py-2.5 text-sm sm:flex-col sm:items-start sm:gap-1"
              >
                <span className="text-ink-secondary">{rule.label}</span>
                <span className="font-mono font-bold tabular-nums text-ink">{rule.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ketentuan Teknis CAT */}
        <div className="mt-6 space-y-2 text-sm text-ink-secondary">
          <h2 className="font-mono text-sm font-bold text-ink">Ketentuan Simulasi CAT</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Urutan soal dan opsi jawaban diacak otomatis per sesi (untuk SKD Penuh tetap berurutan per blok TWK → TIU → TKP).
            </li>
            <li>
              Timer berjalan mundur secara presisi dan jawaban tersimpan otomatis di browser (aman jika halaman tidak sengaja ter-refresh).
            </li>
            <li>
              Ketika waktu mencapai <span className="font-mono font-semibold text-ink">00:00:00</span>, ujian selesai dan dinilai otomatis.
            </li>
          </ul>
        </div>

        {/* Deteksi Sesi Aktif di localStorage */}
        {activeSession ? (
          <div className="mt-6 rounded-[16px] border-[1.5px] border-flag-border bg-flag-bg p-4 sm:p-5">
            <p className="font-mono text-sm font-bold text-flag-text">
              Sesi Ujian Sebelumnya Masih Aktif
            </p>
            <p className="mt-1 text-sm text-flag-text">
              Kamu sudah menjawab{" "}
              <span className="font-mono font-bold tabular-nums">{answeredInSession}</span>{" "}
              soal dengan sisa waktu sekitar{" "}
              <span className="font-mono font-bold tabular-nums">
                {formatRemainingMinutes(activeSession.endTimestamp)}
              </span>
              . Pilih lanjutkan untuk meneruskan progres, atau mulai ulang dari awal.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/exam/${pkg.slug}`}
                className={buttonClasses("primary", "rounded")}
              >
                Lanjutkan Sesi →
              </Link>
              <Button variant="outline" onClick={handleStartFresh}>
                Mulai Ujian Baru
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-6">
            <Link
              href={`/exam/${pkg.slug}`}
              className={buttonClasses("primary", "rounded")}
            >
              Mulai Ujian Sekarang →
            </Link>
            <Link
              href="/aturan-bkn"
              className={buttonClasses("outline", "rounded")}
            >
              Lihat Aturan BKN Lengkap
            </Link>
          </div>
        )}
      </TactileCard>
    </main>
  );
}
