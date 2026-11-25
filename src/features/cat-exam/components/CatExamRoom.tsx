"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Drawer,
  EmptyState,
  Modal,
  TactileCard,
  buttonClasses,
} from "@/components/ui";
import type { QuestionSubtest } from "@/constants/passing-grade";
import { getOptionLabel } from "@/lib/exam-engine/shuffle";
import { useCatExam } from "../hooks/useCatExam";
import { ExamHeader } from "./ExamHeader";
import { QuestionMatrix } from "./QuestionMatrix";

interface CatExamRoomProps {
  slug: string;
}

const SUBTEST_FULL_LABELS: Record<QuestionSubtest, string> = {
  TWK: "Tes Wawasan Kebangsaan (TWK)",
  TIU: "Tes Intelegensia Umum (TIU)",
  TKP: "Tes Karakteristik Pribadi (TKP)",
  SKB: "Seleksi Kompetensi Bidang (SKB)",
};

export function CatExamRoom({ slug }: CatExamRoomProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);

  const {
    pkg,
    session,
    orderedQuestions,
    currentItem,
    remainingSeconds,
    loading,
    error,
    submitting,
    answeredCount,
    flaggedCount,
    unansweredCount,
    selectOption,
    toggleFlag,
    goToIndex,
    goNext,
    goPrev,
    finishExam,
  } = useCatExam({
    slug,
    shortcutsDisabled: drawerOpen || finishModalOpen,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
        <TactileCard className="w-full max-w-md p-6 text-center">
          <p className="font-mono text-base font-bold text-ink">
            Menyiapkan Ruang Ujian CAT...
          </p>
          <p className="mt-2 text-sm text-ink-secondary">
            Mengambil paket soal dan menyiapkan sesi otomatis.
          </p>
        </TactileCard>
      </div>
    );
  }

  if (error || !pkg || !session || !currentItem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
        <div className="w-full max-w-lg">
          <EmptyState
            title="Ruang ujian tidak dapat dimuat"
            description={error ?? "Paket ujian tidak ditemukan atau belum memiliki soal."}
            action={
              <Link href="/" className={buttonClasses("primary", "rounded")}>
                Kembali ke Katalog
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const currentQuestion = currentItem.question;
  const selectedOptionId = session.answers[currentQuestion.id] ?? null;
  const isFlagged = session.flaggedIds.includes(currentQuestion.id);
  const isFirst = session.currentIndex === 0;
  const isLast = session.currentIndex === orderedQuestions.length - 1;

  // Dynamic Density untuk Mobile (< md): padatkan teks & jarak otomatis pada soal/opsi panjang
  // agar soal + opsi A-E muat dalam 1 layar (100dvh) tanpa mengurangi tap target >= 44px.
  const totalChars =
    currentQuestion.question_text.length +
    currentItem.options.reduce((sum, opt) => sum + opt.text.length, 0);
  const isCompactMobile = totalChars > 340;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink md:h-auto md:min-h-screen md:overflow-visible">
      <ExamHeader
        packageTitle={pkg.title}
        currentNumber={session.currentIndex + 1}
        totalQuestions={orderedQuestions.length}
        currentSubtest={currentQuestion.subtest}
        remainingSeconds={remainingSeconds}
        onOpenDrawer={() => setDrawerOpen(true)}
        onRequestFinish={() => setFinishModalOpen(true)}
      />

      <main className="mx-auto grid w-full max-w-[1440px] min-h-0 flex-1 grid-cols-1 gap-4 px-3 py-2.5 sm:px-6 md:py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:px-8">
        {/* Kolom Kiri — Area Soal */}
        <section
          aria-label="Area soal ujian"
          className="flex min-h-0 min-w-0 flex-col md:block"
        >
          <TactileCard className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 md:block md:overflow-visible md:p-8">
            {/* Header Soal — Tablet & Desktop (di Mobile sudah tampil ringkas di ExamHeader) */}
            <div className="hidden flex-wrap items-center justify-between gap-2 md:flex">
              <h1 className="font-mono text-xl font-bold tabular-nums text-ink">
                Soal Nomor {session.currentIndex + 1} dari {orderedQuestions.length}
              </h1>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                {SUBTEST_FULL_LABELS[currentQuestion.subtest]}
              </span>
            </div>

            <hr className="my-4 hidden border-border-subtle md:block" />

            {/* Teks Soal */}
            <div className="space-y-3 md:space-y-4">
              <p
                className={`whitespace-pre-line text-ink md:text-base md:leading-relaxed ${
                  isCompactMobile
                    ? "text-[12.5px] leading-tight"
                    : "text-[13.5px] leading-snug"
                }`}
              >
                {currentQuestion.question_text}
              </p>

              {currentQuestion.image_url && (
                <div className="overflow-hidden rounded-[12px] border border-border-subtle bg-pure p-2 md:rounded-[14px] md:p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.image_url}
                    alt={`Ilustrasi soal nomor ${session.currentIndex + 1}`}
                    className="max-h-44 w-auto max-w-full rounded-lg object-contain md:max-h-80"
                  />
                </div>
              )}
            </div>

            {/* Pilihan Jawaban A-E */}
            <div
              role="radiogroup"
              aria-label="Pilihan jawaban"
              className={`mt-3 md:mt-6 md:space-y-3 ${
                isCompactMobile ? "space-y-1.5" : "space-y-2"
              }`}
            >
              {currentItem.options.map((option, optIdx) => {
                const label = getOptionLabel(optIdx);
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectOption(currentQuestion.id, option.id)}
                    className={`flex min-h-[44px] w-full items-start gap-2.5 rounded-[12px] border-[1.5px] text-left transition-colors md:min-h-[56px] md:gap-3.5 md:rounded-[14px] md:px-4 md:py-3.5 md:text-base md:leading-relaxed ${
                      isCompactMobile
                        ? "px-2.5 py-1.5 text-[12px] leading-tight"
                        : "px-3 py-2 text-[13px] leading-snug"
                    } ${
                      isSelected
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-border-subtle bg-pure text-ink hover:border-ink"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-bold md:h-7 md:w-7 md:rounded-lg md:text-xs ${
                        isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-border-subtle bg-pill text-ink"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </button>
                );
              })}
            </div>

            <hr className="my-6 hidden border-border-subtle md:block" />

            {/* Action Bar — Tablet & Desktop */}
            <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="outline" onClick={goPrev} disabled={isFirst}>
                  ← Sebelumnya
                </Button>
                <Button variant="subtle" onClick={goNext} disabled={isLast}>
                  Lewati
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="flag"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  aria-pressed={isFlagged}
                >
                  {isFlagged ? "Hapus Ragu-ragu" : "Tandai Ragu-ragu"}
                </Button>

                {isLast ? (
                  <Button variant="primary" onClick={() => setFinishModalOpen(true)}>
                    Selesai & Lihat Hasil →
                  </Button>
                ) : (
                  <Button variant="primary" onClick={goNext}>
                    Simpan & Lanjutkan →
                  </Button>
                )}
              </div>
            </div>

            <p className="mt-4 hidden text-xs text-ink-muted lg:block">
              Pintasan keyboard: panah kiri/kanan untuk pindah soal, A–E atau 1–5 untuk
              memilih jawaban, R untuk ragu-ragu.
            </p>
          </TactileCard>
        </section>

        {/* Kolom Kanan — Panel Matriks Desktop */}
        <aside aria-label="Panel navigasi soal" className="hidden lg:block">
          <div className="sticky top-[88px]">
            <TactileCard className="p-5">
              <QuestionMatrix
                orderedQuestions={orderedQuestions}
                currentIndex={session.currentIndex}
                answers={session.answers}
                flaggedIds={session.flaggedIds}
                answeredCount={answeredCount}
                flaggedCount={flaggedCount}
                unansweredCount={unansweredCount}
                onSelectIndex={goToIndex}
              />
            </TactileCard>
          </div>
        </aside>
      </main>

      {/* Mobile Fixed Action Bar (acuan FigCraft Mobile 390x844) */}
      <div className="flex shrink-0 items-center gap-2 border-t-[1.5px] border-ink bg-card px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Soal sebelumnya"
          className="min-h-[44px] px-3 text-xs"
        >
          ←
        </Button>
        <Button
          variant="flag"
          onClick={() => toggleFlag(currentQuestion.id)}
          aria-pressed={isFlagged}
          className="min-h-[44px] px-3 text-xs"
        >
          {isFlagged ? "Ragu ✓" : "Ragu"}
        </Button>
        {isLast ? (
          <Button
            variant="primary"
            onClick={() => setFinishModalOpen(true)}
            className="min-h-[44px] flex-1 px-3 text-xs"
          >
            Selesai & Hasil →
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={goNext}
            className="min-h-[44px] flex-1 px-3 text-xs"
          >
            Simpan & Lanjut →
          </Button>
        )}
      </div>

      {/* Drawer Daftar Soal (Mobile & Tablet) */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Daftar Soal"
      >
        <QuestionMatrix
          orderedQuestions={orderedQuestions}
          currentIndex={session.currentIndex}
          answers={session.answers}
          flaggedIds={session.flaggedIds}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          unansweredCount={unansweredCount}
          onSelectIndex={(idx) => {
            goToIndex(idx);
            setDrawerOpen(false);
          }}
        />
      </Drawer>

      {/* Modal Konfirmasi Selesai Ujian */}
      <Modal
        open={finishModalOpen}
        onClose={() => setFinishModalOpen(false)}
        title="Akhiri Ujian Sekarang?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setFinishModalOpen(false)}
              disabled={submitting}
            >
              Lanjutkan Mengerjakan
            </Button>
            <Button
              variant="primary"
              onClick={() => finishExam(false)}
              disabled={submitting}
            >
              {submitting ? "Menghitung Skor..." : "Ya, Selesaikan Ujian"}
            </Button>
          </>
        }
      >
        <p>
          Pastikan jawaban sudah kamu periksa. Setelah diakhiri, kamu langsung melihat
          skor total, status passing grade, dan pembahasan lengkap.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] border border-border-subtle bg-pill p-3 text-center text-xs font-semibold tabular-nums">
          <span className="text-accent-dark">{answeredCount} Terjawab</span>
          <span className="text-flag-text">{flaggedCount} Ragu</span>
          <span className="text-ink-secondary">{unansweredCount} Kosong</span>
        </div>
      </Modal>
    </div>
  );
}
