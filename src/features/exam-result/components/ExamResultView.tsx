"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, TactileCard, buttonClasses } from "@/components/ui";
import { SKD_PASSING_GRADE, type QuestionSubtest } from "@/constants/passing-grade";
import {
  fetchPackageQuestions,
  loadLastExamResult,
  markLastExamResultSaved,
  saveLastExamResult,
  type LastExamResultCache,
} from "@/features/cat-exam";
import { calculateExamScore } from "@/lib/exam-engine/scoring";
import { getOptionLabel } from "@/lib/exam-engine/shuffle";
import {
  clearPendingGuestResult,
  loadPendingGuestResult,
} from "@/lib/storage/exam-storage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ExamPackageRow, QuestionOption, QuestionRow } from "@/lib/supabase/types";
import { submitExamScoreRequest } from "../api/scores.api";

interface ExamResultViewProps {
  slug: string;
}

type ReviewFilter = "ALL" | "INCORRECT" | "OPTIMAL" | "EMPTY";

function formatDurationReadable(totalSeconds: number): string {
  const safe = Math.max(1, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}m ${seconds}d`;
}

function getOptionDisplayLabel(
  optionId: string | null,
  options: readonly QuestionOption[],
  optionOrder?: readonly string[],
): { label: string; text: string } | null {
  if (!optionId) return null;
  const opt = options.find((item) => item.id === optionId);
  if (!opt) return null;
  const orderList = optionOrder ?? options.map((item) => item.id);
  const idx = orderList.indexOf(optionId);
  const label = idx >= 0 ? getOptionLabel(idx) : "-";
  return { label, text: opt.text };
}

export function ExamResultView({ slug }: ExamResultViewProps) {
  const [pkg, setPkg] = useState<ExamPackageRow | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [attempt, setAttempt] = useState<LastExamResultCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<
    "guest" | "saving" | "saved" | "error"
  >("guest");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("ALL");
  const [subtestFilter, setSubtestFilter] = useState<QuestionSubtest | "ALL">("ALL");

  const didSyncRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadResultData() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPackageQuestions(slug);
        if (!active) return;

        const pending = loadPendingGuestResult();
        const cached = loadLastExamResult(data.package.slug);

        let resolvedAttempt: LastExamResultCache | null = null;

        if (pending && pending.packageSlug === data.package.slug) {
          const fallbackQuestionOrder = data.questions.map((q) => q.id);
          const fallbackOptionOrders: Record<string, string[]> = {};
          for (const q of data.questions) {
            fallbackOptionOrders[q.id] = q.options.map((o) => o.id);
          }

          resolvedAttempt = {
            version: 1,
            clientAttemptId: pending.clientAttemptId,
            packageId: pending.packageId,
            packageSlug: pending.packageSlug,
            answers: pending.answers,
            questionOrder:
              cached && cached.clientAttemptId === pending.clientAttemptId
                ? cached.questionOrder
                : fallbackQuestionOrder,
            optionOrders:
              cached && cached.clientAttemptId === pending.clientAttemptId
                ? cached.optionOrders
                : fallbackOptionOrders,
            durationSeconds: Math.min(
              Math.max(1, pending.durationSeconds),
              Math.max(1, data.package.duration_minutes * 60),
            ),
            completedAt: pending.completedAt,
            savedToServer:
              cached && cached.clientAttemptId === pending.clientAttemptId
                ? cached.savedToServer
                : false,
          };
          saveLastExamResult(resolvedAttempt);
        } else if (cached && cached.packageSlug === data.package.slug) {
          resolvedAttempt = cached;
        }

        setPkg(data.package);
        setQuestions(data.questions);
        setAttempt(resolvedAttempt);
        if (resolvedAttempt?.savedToServer) {
          setSaveState("saved");
        }
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat hasil ujian dan pembahasan.",
        );
        setLoading(false);
      }
    }

    loadResultData();
    return () => {
      active = false;
    };
  }, [slug]);

  // Jika pengguna sudah login, otomatis simpan skor ke POST /api/scores
  // dan pertahankan data hasil di state + sessionStorage agar tidak hilang saat refresh
  useEffect(() => {
    if (!pkg || !attempt || didSyncRef.current) return;
    if (attempt.savedToServer) {
      setSaveState("saved");
      return;
    }

    didSyncRef.current = true;
    let active = true;

    async function syncIfAuthenticated() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!active) return;

        if (!data.user) {
          setSaveState("guest");
          return;
        }

        setSaveState("saving");
        const maxDurationSeconds = Math.max(1, pkg!.duration_minutes * 60);
        const clampedDuration = Math.min(
          Math.max(1, attempt!.durationSeconds),
          maxDurationSeconds,
        );

        const outcome = await submitExamScoreRequest({
          packageId: attempt!.packageId,
          clientAttemptId: attempt!.clientAttemptId,
          answers: attempt!.answers,
          durationSeconds: clampedDuration,
        });

        if (!active) return;

        if (outcome.status === "saved") {
          clearPendingGuestResult();
          markLastExamResultSaved(pkg!.slug);
          setAttempt((prev) => (prev ? { ...prev, savedToServer: true } : prev));
          setSaveState("saved");
        } else {
          setSaveState("guest");
        }
      } catch (err) {
        if (!active) return;
        setSaveState("error");
        setSaveError(
          err instanceof Error
            ? err.message
            : "Skor belum berhasil disimpan ke server.",
        );
      }
    }

    syncIfAuthenticated();
    return () => {
      active = false;
    };
  }, [pkg, attempt]);

  const orderedQuestions = useMemo<QuestionRow[]>(() => {
    if (!attempt || questions.length === 0) return questions;
    const byId: Record<string, QuestionRow> = {};
    for (const q of questions) {
      byId[q.id] = q;
    }
    const list: QuestionRow[] = [];
    for (const id of attempt.questionOrder) {
      const q = byId[id];
      if (q) list.push(q);
    }
    return list.length > 0 ? list : questions;
  }, [attempt, questions]);

  const scoreResult = useMemo(() => {
    if (!pkg || !attempt || orderedQuestions.length === 0) return null;
    return calculateExamScore(pkg, orderedQuestions, attempt.answers);
  }, [pkg, attempt, orderedQuestions]);

  const reviewItems = useMemo(() => {
    if (!scoreResult) return [];
    return orderedQuestions.map((question, idx) => ({
      displayNumber: idx + 1,
      question,
      review: scoreResult.reviews[idx]!,
    }));
  }, [orderedQuestions, scoreResult]);

  const filteredReviews = useMemo(() => {
    return reviewItems.filter((item) => {
      if (subtestFilter !== "ALL" && item.question.subtest !== subtestFilter) {
        return false;
      }
      if (reviewFilter === "OPTIMAL") {
        return item.review.isOptimal;
      }
      if (reviewFilter === "INCORRECT") {
        return !item.review.isOptimal;
      }
      if (reviewFilter === "EMPTY") {
        return item.review.selectedOptionId === null;
      }
      return true;
    });
  }, [reviewItems, reviewFilter, subtestFilter]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <TactileCard className="p-8 text-center">
          <p className="font-mono text-base font-bold text-ink">
            Menyiapkan Hasil & Pembahasan...
          </p>
        </TactileCard>
      </main>
    );
  }

  if (error || !pkg) {
    return (
      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Hasil ujian tidak dapat dimuat"
          description={error ?? "Paket ujian tidak ditemukan."}
          action={
            <Link href="/" className={buttonClasses("primary", "rounded")}>
              Kembali ke Home
            </Link>
          }
        />
      </main>
    );
  }

  if (!attempt || !scoreResult) {
    return (
      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Belum ada hasil simulasi untuk paket ini"
          description="Selesaikan simulasi ujian terlebih dahulu untuk melihat skor total, status passing grade, dan pembahasan soal."
          action={
            <Link
              href={`/packages/${pkg.slug}`}
              className={buttonClasses("primary", "rounded")}
            >
              Mulai Simulasi Paket Ini →
            </Link>
          }
        />
      </main>
    );
  }

  const maxPossibleTotal = scoreResult.reviews.reduce(
    (sum, item) => sum + item.maxScore,
    0,
  );

  const pgTwk = pkg.passing_grade_twk ?? SKD_PASSING_GRADE.TWK;
  const pgTiu = pkg.passing_grade_tiu ?? SKD_PASSING_GRADE.TIU;
  const pgTkp = pkg.passing_grade_tkp ?? SKD_PASSING_GRADE.TKP;

  const subtestCards: {
    key: QuestionSubtest;
    label: string;
    score: number;
    passed: boolean | null;
    pgText: string;
  }[] = [];

  if (pkg.category === "SKD_FULL" || pkg.category === "MINI_TWK") {
    subtestCards.push({
      key: "TWK",
      label: "TWK (Wawasan Kebangsaan)",
      score: scoreResult.scoreTwk,
      passed: scoreResult.subtestPassed.twk,
      pgText: `PG ${pgTwk}`,
    });
  }
  if (pkg.category === "SKD_FULL" || pkg.category === "MINI_TIU") {
    subtestCards.push({
      key: "TIU",
      label: "TIU (Intelegensia Umum)",
      score: scoreResult.scoreTiu,
      passed: scoreResult.subtestPassed.tiu,
      pgText: `PG ${pgTiu}`,
    });
  }
  if (pkg.category === "SKD_FULL" || pkg.category === "MINI_TKP") {
    subtestCards.push({
      key: "TKP",
      label: "TKP (Karakteristik Pribadi)",
      score: scoreResult.scoreTkp,
      passed: scoreResult.subtestPassed.tkp,
      pgText: `PG ${pgTkp}`,
    });
  }
  if (pkg.category === "SKB") {
    subtestCards.push({
      key: "SKB",
      label: "SKB (Kompetensi Bidang)",
      score: scoreResult.scoreSkb,
      passed: true,
      pgText: "Benar +5 • Salah 0",
    });
  }

  const incorrectCount = reviewItems.filter((i) => !i.review.isOptimal).length;
  const optimalCount = reviewItems.filter((i) => i.review.isOptimal).length;
  const emptyCount = reviewItems.filter((i) => i.review.selectedOptionId === null).length;

  return (
    <main className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner Guest-to-Auth Handoff / Status Simpan */}
      {saveState === "guest" && (
        <TactileCard shadow="sm" className="p-5 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <p className="font-mono text-sm font-bold text-ink">
                Skor Tersimpan Lokal (Mode Guest)
              </p>
              <p className="text-sm text-ink-secondary">
                Masuk dengan Google atau Email untuk menyimpan skor ini secara permanen ke Papan Peringkat dan Riwayat Tryout.
              </p>
            </div>
            <Link
              href={`/login?next=${encodeURIComponent(`/result/${pkg.slug}`)}`}
              className={buttonClasses("primary", "rounded", "shrink-0")}
            >
              Login & Simpan ke Peringkat →
            </Link>
          </div>
        </TactileCard>
      )}

      {saveState === "saving" && (
        <TactileCard shadow="sm" className="p-4 sm:p-5">
          <p className="text-sm font-medium text-ink-secondary">
            Menyimpan skor ke Papan Peringkat...
          </p>
        </TactileCard>
      )}

      {saveState === "saved" && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-[18px] border-[1.5px] border-accent bg-accent-soft p-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-accent-dark">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
            <span>Skor berhasil disimpan ke Papan Peringkat.</span>
          </div>
          <Link
            href="/leaderboard"
            className={buttonClasses("outline", "rounded", "shrink-0")}
          >
            Lihat Papan Peringkat →
          </Link>
        </div>
      )}

      {saveState === "error" && (
        <div className="rounded-[18px] border-[1.5px] border-danger-border bg-danger-bg p-4 text-sm text-danger-text sm:px-6">
          {saveError ?? "Gagal menyimpan skor ke server. Skor tetap tersimpan sementara di browser."}
        </div>
      )}

      {/* Score Summary Tactile Card */}
      <TactileCard className="p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="font-mono text-base font-semibold leading-snug text-ink sm:text-lg">
            Hasil Ujian CAT • {pkg.title}
          </h1>
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold sm:text-sm ${
              scoreResult.isPassed ? "text-accent-dark" : "text-danger-text"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                scoreResult.isPassed ? "bg-accent" : "bg-danger-border"
              }`}
              aria-hidden="true"
            />
            {scoreResult.isPassed
              ? "Lulus Passing Grade"
              : "Belum Memenuhi Passing Grade"}{" "}
            ({formatDurationReadable(attempt.durationSeconds)})
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Total Skor (Hijau Muda #E6F4DC) */}
          <div className="rounded-[16px] border-[1.5px] border-accent bg-accent-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Total Skor
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold tabular-nums text-accent-dark">
                {scoreResult.totalScore}
              </span>
              <span className="font-mono text-sm text-ink-secondary tabular-nums">
                / {maxPossibleTotal}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary tabular-nums">
              Terjawab {scoreResult.answeredCount} dari {scoreResult.totalQuestions} soal
            </p>
          </div>

          {/* Kartu per Subtes */}
          {subtestCards.map((card) => (
            <div
              key={card.key}
              className="rounded-[16px] border-[1.5px] border-ink bg-pure p-4"
            >
              <p className="text-xs font-medium text-ink-secondary">{card.label}</p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-ink">
                {card.score}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  card.passed === false ? "text-danger-text" : "text-accent-dark"
                }`}
              >
                {card.passed === false ? "Tidak Lulus" : "Lulus"} • {card.pgText}
              </p>
            </div>
          ))}
        </div>
      </TactileCard>

      {/* Pembahasan Soal */}
      <TactileCard className="p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-mono text-base font-semibold text-ink sm:text-lg">
              Pembahasan Soal
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Tinjau jawaban kamu dibandingkan dengan kunci jawaban dan penjelasan resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/packages/${pkg.slug}`}
              className={buttonClasses("outline", "rounded")}
            >
              Ulangi Tryout
            </Link>
            <Link href="/" className={buttonClasses("subtle", "rounded")}>
              Paket Lainnya
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter status jawaban">
            {(
              [
                { id: "ALL", label: `Semua (${reviewItems.length})` },
                { id: "INCORRECT", label: `Salah / Belum Maks (${incorrectCount})` },
                { id: "OPTIMAL", label: `Benar / Maks (${optimalCount})` },
                { id: "EMPTY", label: `Kosong (${emptyCount})` },
              ] as const
            ).map((tab) => {
              const active = reviewFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setReviewFilter(tab.id)}
                  className={`min-h-[40px] rounded-[10px] border px-3.5 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? "border-ink bg-accent-highlight text-ink"
                      : "border-border-subtle bg-pill text-ink-secondary hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {pkg.category === "SKD_FULL" && (
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter subtes pembahasan">
              {(["ALL", "TWK", "TIU", "TKP"] as const).map((sub) => {
                const active = subtestFilter === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSubtestFilter(sub)}
                    className={`min-h-[36px] rounded-[10px] border px-3 text-xs font-semibold transition-colors ${
                      active
                        ? "border-ink bg-accent-highlight text-ink"
                        : "border-border-subtle bg-pill text-ink-secondary hover:text-ink"
                    }`}
                  >
                    {sub === "ALL" ? "Semua Subtes" : sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Daftar Review Soal */}
        <div className="mt-6 space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="rounded-[16px] border border-border-subtle bg-pure p-6 text-center text-sm text-ink-secondary">
              Tidak ada soal yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            filteredReviews.map(({ displayNumber, question, review }) => {
              const optionOrder = attempt.optionOrders[question.id];
              const userChoice = getOptionDisplayLabel(
                review.selectedOptionId,
                question.options,
                optionOrder,
              );
              const bestChoice = getOptionDisplayLabel(
                review.bestOptionId,
                question.options,
                optionOrder,
              );

              const scoreLabel =
                review.selectedOptionId === null
                  ? "Kosong (0)"
                  : review.isOptimal
                    ? `Benar (+${review.earnedScore})`
                    : review.earnedScore > 0
                      ? `Poin (+${review.earnedScore}/${review.maxScore})`
                      : "Salah (0)";

              const scoreColorClass =
                review.isOptimal
                  ? "text-accent-dark"
                  : review.earnedScore > 0
                    ? "text-flag-text"
                    : "text-danger-text";

              return (
                <article
                  key={question.id}
                  className="rounded-[16px] border border-border-subtle bg-pure p-4 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-mono text-sm font-bold text-ink">
                      Soal No. {displayNumber} • {question.subtest}
                    </h3>
                    <span className={`font-mono text-sm font-bold tabular-nums ${scoreColorClass}`}>
                      {scoreLabel}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink sm:text-base">
                    {question.question_text}
                  </p>

                  {question.image_url && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={question.image_url}
                        alt={`Ilustrasi soal nomor ${displayNumber}`}
                        className="max-h-64 w-auto max-w-full rounded-lg border border-border-subtle object-contain"
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-1.5 text-sm">
                    <p className={scoreColorClass}>
                      <span className="font-semibold">Jawaban Kamu:</span>{" "}
                      {userChoice
                        ? `${userChoice.label}. ${userChoice.text}`
                        : "Tidak dijawab"}
                    </p>
                    {bestChoice && (
                      <p className="text-accent-dark">
                        <span className="font-semibold">
                          {question.subtest === "TKP"
                            ? `Opsi Poin Tertinggi (+${review.maxScore}):`
                            : "Kunci Jawaban:"}
                        </span>{" "}
                        {bestChoice.label}. {bestChoice.text}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 rounded-[12px] bg-pill p-3.5 text-sm leading-relaxed text-ink-secondary">
                    <span className="font-semibold text-ink">Pembahasan:</span>{" "}
                    {question.explanation}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </TactileCard>
    </main>
  );
}
