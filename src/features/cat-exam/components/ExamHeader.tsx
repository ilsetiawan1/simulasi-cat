"use client";

import { Button } from "@/components/ui";
import type { QuestionSubtest } from "@/constants/passing-grade";
import { formatCountdown } from "../hooks/useCatExam";

interface ExamHeaderProps {
  packageTitle: string;
  currentSubtest: QuestionSubtest;
  remainingSeconds: number;
  onOpenDrawer: () => void;
  onRequestFinish: () => void;
}

const SUBTEST_SHORT: Record<QuestionSubtest, string> = {
  TWK: "TWK",
  TIU: "TIU",
  TKP: "TKP",
  SKB: "SKB",
};

export function ExamHeader({
  packageTitle,
  currentSubtest,
  remainingSeconds,
  onOpenDrawer,
  onRequestFinish,
}: ExamHeaderProps) {
  const isCritical = remainingSeconds <= 300;

  return (
    <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-card">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Info Paket */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            simcat
          </span>
          <span className="hidden h-5 w-px bg-border-subtle sm:inline-block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{packageTitle}</p>
            <p className="truncate text-xs text-ink-secondary">
              Subtes: {SUBTEST_SHORT[currentSubtest]} • Auto-Save Aktif
            </p>
          </div>
        </div>

        {/* Timer + Aksi */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            aria-live="polite"
            className={`flex min-h-[44px] items-center gap-2.5 rounded-[12px] border-[1.5px] px-3.5 py-1.5 ${
              isCritical
                ? "border-danger-border bg-danger-bg text-danger-text"
                : "border-ink bg-pill text-ink"
            }`}
          >
            <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-ink-secondary sm:inline">
              Sisa Waktu
            </span>
            <span className="font-mono text-base font-bold tabular-nums sm:text-lg">
              {formatCountdown(remainingSeconds)}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={onOpenDrawer}
            className="px-3.5 lg:hidden"
          >
            Daftar Soal
          </Button>

          <Button
            variant="danger"
            onClick={onRequestFinish}
            className="px-3.5 sm:px-4"
          >
            Selesai Ujian
          </Button>
        </div>
      </div>
    </header>
  );
}
