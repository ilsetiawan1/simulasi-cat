"use client";

import { Button } from "@/components/ui";
import type { QuestionSubtest } from "@/constants/passing-grade";
import { formatCountdown } from "../hooks/useCatExam";

interface ExamHeaderProps {
  packageTitle: string;
  currentNumber: number;
  totalQuestions: number;
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
  currentNumber,
  totalQuestions,
  currentSubtest,
  remainingSeconds,
  onOpenDrawer,
  onRequestFinish,
}: ExamHeaderProps) {
  const isCritical = remainingSeconds <= 300;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b-[1.5px] border-ink bg-card">
      {/* Mobile Compact 1-Row Header (60px — acuan FigCraft Mobile 390x844) */}
      <div className="flex h-[58px] w-full items-center justify-between gap-2 px-3 md:hidden">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold tabular-nums text-ink">
            No. {currentNumber}/{totalQuestions}
          </p>
          <p className="font-mono text-[11px] font-bold text-accent-dark">
            {SUBTEST_SHORT[currentSubtest]}
          </p>
        </div>

        <div
          aria-live="polite"
          className={`flex min-h-[36px] shrink-0 items-center rounded-[10px] border-[1.5px] px-2.5 py-1 ${
            isCritical
              ? "border-danger-border bg-danger-bg text-danger-text"
              : "border-ink bg-pill text-ink"
          }`}
        >
          <span className="font-mono text-sm font-bold tabular-nums">
            {formatCountdown(remainingSeconds)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            onClick={onOpenDrawer}
            className="min-h-[40px] px-2.5 py-1 text-xs"
          >
            Daftar Soal
          </Button>
          <Button
            variant="danger"
            onClick={onRequestFinish}
            className="min-h-[40px] px-2.5 py-1 text-xs"
          >
            Selesai
          </Button>
        </div>
      </div>

      {/* Tablet & Desktop Spacious Header */}
      <div className="mx-auto hidden w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-6 py-3 md:flex lg:px-8">
        {/* Brand & Info Paket */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 font-display text-lg font-extrabold tracking-tight text-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              width={26}
              height={26}
              className="h-[26px] w-[26px] shrink-0 object-contain"
            />
            <span>simcat</span>
          </span>
          <span className="h-5 w-px bg-border-subtle" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{packageTitle}</p>
            <p className="truncate text-xs text-ink-secondary">
              Subtes: {SUBTEST_SHORT[currentSubtest]} • Auto-Save Aktif
            </p>
          </div>
        </div>

        {/* Timer + Aksi */}
        <div className="flex items-center gap-3">
          <div
            aria-live="polite"
            className={`flex min-h-[44px] items-center gap-2.5 rounded-[12px] border-[1.5px] px-3.5 py-1.5 ${
              isCritical
                ? "border-danger-border bg-danger-bg text-danger-text"
                : "border-ink bg-pill text-ink"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
              Sisa Waktu
            </span>
            <span className="font-mono text-lg font-bold tabular-nums">
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
            className="px-4"
          >
            Selesai Ujian
          </Button>
        </div>
      </div>
    </header>
  );
}
