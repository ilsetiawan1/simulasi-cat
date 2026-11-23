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

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <ExamHeader
        packageTitle={pkg.title}
        currentSubtest={currentQuestion.subtest}
        remainingSeconds={remainingSeconds}
        onOpenDrawer={() => setDrawerOpen(true)}
        onRequestFinish={() => setFinishModalOpen(true)}
      />

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        {/* Kolom Kiri — Area Soal */}
        <section aria-label="Area soal ujian" className="min-w-0">
          <TactileCard className="p-5 sm:p-8">
            {/* Header Soal */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="font-mono text-lg font-bold tabular-nums text-ink sm:text-xl">
                Soal Nomor {session.currentIndex + 1} dari {orderedQuestions.length}
              </h1>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent-dark sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                {SUBTEST_FULL_LABELS[currentQuestion.subtest]}
              </span>
            </div>

            <hr className="my-4 border-border-subtle" />

            {/* Teks Soal */}
            <div className="space-y-4">
              <p className="whitespace-pre-line text-base leading-relaxed text-ink">
                {currentQuestion.question_text}
              </p>

              {currentQuestion.image_url && (
                <div className="overflow-hidden rounded-[14px] border border-border-subtle bg-pure p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.image_url}
                    alt={`Ilustrasi soal nomor ${session.currentIndex + 1}`}
                    className="max-h-80 w-auto max-w-full rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            {/* Pilihan Jawaban A-E */}
            <div
              role="radiogroup"
              aria-label="Pilihan jawaban"
              className="mt-6 space-y-3"
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
                    className={`flex min-h-[56px] w-full items-start gap-3.5 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left text-sm leading-relaxed transition-colors sm:text-base ${
                      isSelected
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-border-subtle bg-pure text-ink hover:border-ink"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
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

            <hr className="my-6 border-border-subtle" />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={isFirst}
                >
                  ← Sebelumnya
                </Button>
                <Button
                  variant="subtle"
                  onClick={goNext}
                  disabled={isLast}
                >
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
                  <Button
                    variant="primary"
                    onClick={() => setFinishModalOpen(true)}
                  >
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
              Pintasan keyboard: panah kiri/kanan untuk pindah soal, A–E atau 1–5 untuk memilih jawaban, R untuk ragu-ragu.
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
          Pastikan jawaban sudah kamu periksa. Setelah diakhiri, kamu langsung melihat skor total, status passing grade, dan pembahasan lengkap.
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
