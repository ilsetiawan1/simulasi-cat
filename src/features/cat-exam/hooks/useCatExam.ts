"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildExamSessionOrder } from "@/lib/exam-engine/shuffle";
import {
  clearExamSession,
  loadExamSession,
  loadExamSessionPayload,
  saveExamSession,
  saveExamSessionPayload,
  savePendingGuestResult,
  type ExamSessionState,
} from "@/lib/storage/exam-storage";
import type { ExamPackageRow, QuestionOption, QuestionRow } from "@/lib/supabase/types";
import { fetchPackageQuestions } from "../api/questions.api";
import { saveLastExamResult } from "../utils/result-cache";

export interface OrderedQuestionItem {
  question: QuestionRow;
  options: QuestionOption[];
}

export interface UseCatExamOptions {
  slug: string;
  shortcutsDisabled: boolean;
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useCatExam({ slug, shortcutsDisabled }: UseCatExamOptions) {
  const router = useRouter();
  const [pkg, setPkg] = useState<ExamPackageRow | null>(null);
  const [questionsById, setQuestionsById] = useState<Record<string, QuestionRow>>({});
  const [session, setSession] = useState<ExamSessionState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasSubmittedRef = useRef(false);
  const sessionRef = useRef<ExamSessionState | null>(null);
  const pkgRef = useRef<ExamPackageRow | null>(null);
  const questionsRef = useRef<QuestionRow[]>([]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    pkgRef.current = pkg;
  }, [pkg]);

  const finishExam = useCallback(
    (isTimeout = false) => {
      if (hasSubmittedRef.current) return;
      const activeSession = sessionRef.current;
      const activePkg = pkgRef.current;
      if (!activeSession || !activePkg) return;

      hasSubmittedRef.current = true;
      setSubmitting(true);

      const maxDurationSeconds = Math.max(1, activePkg.duration_minutes * 60);
      const rawSeconds = isTimeout
        ? maxDurationSeconds
        : Math.round((Date.now() - activeSession.startedAt) / 1000);
      const durationSeconds = Math.min(Math.max(1, rawSeconds), maxDurationSeconds);
      const completedAt = new Date().toISOString();

      savePendingGuestResult({
        version: 1,
        clientAttemptId: activeSession.clientAttemptId,
        packageId: activePkg.id,
        packageSlug: activePkg.slug,
        answers: activeSession.answers,
        durationSeconds,
        completedAt,
      });

      saveLastExamResult({
        version: 1,
        clientAttemptId: activeSession.clientAttemptId,
        packageId: activePkg.id,
        packageSlug: activePkg.slug,
        answers: activeSession.answers,
        questionOrder: activeSession.questionOrder,
        optionOrders: activeSession.optionOrders,
        durationSeconds,
        completedAt,
        savedToServer: false,
        package: activePkg,
        questions: questionsRef.current,
      });

      clearExamSession(activePkg.slug);
      router.replace(`/result/${activePkg.slug}`);
    },
    [router],
  );

  // Pulihkan sesi & snapshot soal dari localStorage bila masih aktif (anti-reset saat refresh),
  // atau 1x fetch undian soal baru dari server bila memulai sesi baru.
  useEffect(() => {
    let active = true;

    async function initExam() {
      setLoading(true);
      setError(null);

      try {
        const saved = loadExamSession(slug);
        const savedPayload = loadExamSessionPayload(slug);

        let resolvedPkg: ExamPackageRow;
        let resolvedQuestions: QuestionRow[];
        let qMap: Record<string, QuestionRow> = {};
        let activeSession: ExamSessionState;

        const canRestoreSnapshot = (() => {
          if (!saved || !savedPayload) return false;
          if (saved.packageId !== savedPayload.package.id) return false;
          if (savedPayload.questions.length === 0) return false;
          if (saved.questionOrder.length !== savedPayload.questions.length) return false;
          const map: Record<string, QuestionRow> = {};
          for (const q of savedPayload.questions) {
            map[q.id] = q;
          }
          if (!saved.questionOrder.every((id) => map[id] !== undefined)) return false;
          qMap = map;
          return true;
        })();

        if (canRestoreSnapshot && saved && savedPayload) {
          resolvedPkg = savedPayload.package;
          resolvedQuestions = savedPayload.questions;
          activeSession = {
            ...saved,
            currentIndex: Math.min(saved.currentIndex, saved.questionOrder.length - 1),
          };
        } else {
          const data = await fetchPackageQuestions(slug);
          if (!active) return;

          if (data.questions.length === 0) {
            setError("Belum ada soal yang tersedia untuk paket ini.");
            setLoading(false);
            return;
          }

          resolvedPkg = data.package;
          resolvedQuestions = data.questions;
          qMap = {};
          for (const q of data.questions) {
            qMap[q.id] = q;
          }

          const { questionOrder, optionOrders } = buildExamSessionOrder(
            data.questions,
            data.package.category,
          );
          const startedAt = Date.now();
          const endTimestamp = startedAt + data.package.duration_minutes * 60_000;

          activeSession = {
            version: 1,
            clientAttemptId: crypto.randomUUID(),
            packageId: data.package.id,
            packageSlug: data.package.slug,
            startedAt,
            endTimestamp,
            currentIndex: 0,
            questionOrder,
            optionOrders,
            answers: {},
            flaggedIds: [],
          };
          saveExamSession(activeSession);
          saveExamSessionPayload(data.package.slug, {
            version: 1,
            package: data.package,
            questions: data.questions,
          });
        }

        if (!active) return;

        setPkg(resolvedPkg);
        setQuestionsById(qMap);
        setSession(activeSession);
        sessionRef.current = activeSession;
        pkgRef.current = resolvedPkg;
        questionsRef.current = resolvedQuestions;

        const initialRemaining = Math.max(
          0,
          Math.ceil((activeSession.endTimestamp - Date.now()) / 1000),
        );
        setRemainingSeconds(initialRemaining);
        setLoading(false);

        if (initialRemaining <= 0) {
          finishExam(true);
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyiapkan ruang ujian.",
        );
        setLoading(false);
      }
    }

    initExam();
    return () => {
      active = false;
    };
  }, [slug, finishExam]);

  // Countdown timer berbasis endTimestamp + auto-submit
  useEffect(() => {
    if (!session || loading || submitting) return;

    const timerId = window.setInterval(() => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((session.endTimestamp - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        window.clearInterval(timerId);
        finishExam(true);
      }
    }, 500);

    return () => window.clearInterval(timerId);
  }, [session, loading, submitting, finishExam]);

  const orderedQuestions = useMemo<OrderedQuestionItem[]>(() => {
    if (!session) return [];
    const list: OrderedQuestionItem[] = [];
    for (const qId of session.questionOrder) {
      const question = questionsById[qId];
      if (!question) continue;
      const optionOrder = session.optionOrders[qId] ?? question.options.map((o) => o.id);
      const optionsById: Record<string, QuestionOption> = {};
      for (const opt of question.options) {
        optionsById[opt.id] = opt;
      }
      const orderedOptions: QuestionOption[] = [];
      for (const optId of optionOrder) {
        const opt = optionsById[optId];
        if (opt) orderedOptions.push(opt);
      }
      list.push({ question, options: orderedOptions });
    }
    return list;
  }, [session, questionsById]);

  const updateSession = useCallback(
    (updater: (prev: ExamSessionState) => ExamSessionState) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveExamSession(next);
        return next;
      });
    },
    [],
  );

  const selectOption = useCallback(
    (questionId: string, optionId: string) => {
      updateSession((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: optionId,
        },
      }));
    },
    [updateSession],
  );

  const toggleFlag = useCallback(
    (questionId: string) => {
      updateSession((prev) => {
        const exists = prev.flaggedIds.includes(questionId);
        const flaggedIds = exists
          ? prev.flaggedIds.filter((id) => id !== questionId)
          : [...prev.flaggedIds, questionId];
        return { ...prev, flaggedIds };
      });
    },
    [updateSession],
  );

  const goToIndex = useCallback(
    (index: number) => {
      updateSession((prev) => {
        const clamped = Math.min(Math.max(0, index), prev.questionOrder.length - 1);
        return { ...prev, currentIndex: clamped };
      });
    },
    [updateSession],
  );

  const goNext = useCallback(() => {
    updateSession((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questionOrder.length - 1),
    }));
  }, [updateSession]);

  const goPrev = useCallback(() => {
    updateSession((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, [updateSession]);

  // Keyboard shortcuts (abaikan jika Ctrl/Meta/Alt aktif atau modal/drawer terbuka)
  useEffect(() => {
    if (shortcutsDisabled || loading || submitting || !session) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableElement(event.target)) return;

      const currentItem = orderedQuestions[session?.currentIndex ?? 0];
      if (!currentItem) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }

      const lower = event.key.toLowerCase();
      if (lower === "r") {
        event.preventDefault();
        toggleFlag(currentItem.question.id);
        return;
      }

      const keyToOptionIndex: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      };
      const optIdx = keyToOptionIndex[lower];
      if (optIdx !== undefined) {
        const targetOption = currentItem.options[optIdx];
        if (targetOption) {
          event.preventDefault();
          selectOption(currentItem.question.id, targetOption.id);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    shortcutsDisabled,
    loading,
    submitting,
    session,
    orderedQuestions,
    goPrev,
    goNext,
    toggleFlag,
    selectOption,
  ]);

  const currentItem = session ? (orderedQuestions[session.currentIndex] ?? null) : null;
  const answeredCount = session ? Object.keys(session.answers).length : 0;
  const flaggedCount = session ? session.flaggedIds.length : 0;
  const unansweredCount = Math.max(0, orderedQuestions.length - answeredCount);

  return {
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
  };
}
