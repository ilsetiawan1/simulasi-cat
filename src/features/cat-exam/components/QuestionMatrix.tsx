"use client";

import { useMemo, useState } from "react";
import type { QuestionSubtest } from "@/constants/passing-grade";
import type { OrderedQuestionItem } from "../hooks/useCatExam";

interface QuestionMatrixProps {
  orderedQuestions: OrderedQuestionItem[];
  currentIndex: number;
  answers: Record<string, string>;
  flaggedIds: string[];
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  onSelectIndex: (index: number) => void;
}

interface SubtestGroup {
  subtest: QuestionSubtest;
  startIndex: number;
  endIndex: number;
}

export function QuestionMatrix({
  orderedQuestions,
  currentIndex,
  answers,
  flaggedIds,
  answeredCount,
  flaggedCount,
  unansweredCount,
  onSelectIndex,
}: QuestionMatrixProps) {
  const flaggedSet = useMemo(() => new Set(flaggedIds), [flaggedIds]);

  const subtestGroups = useMemo<SubtestGroup[]>(() => {
    const groups: SubtestGroup[] = [];
    for (let i = 0; i < orderedQuestions.length; i += 1) {
      const subtest = orderedQuestions[i]?.question.subtest;
      if (!subtest) continue;
      const last = groups[groups.length - 1];
      if (last && last.subtest === subtest) {
        last.endIndex = i;
      } else {
        groups.push({ subtest, startIndex: i, endIndex: i });
      }
    }
    return groups;
  }, [orderedQuestions]);

  const [selectedSubtest, setSelectedSubtest] = useState<QuestionSubtest | "ALL">("ALL");

  const visibleIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = 0; i < orderedQuestions.length; i += 1) {
      const item = orderedQuestions[i];
      if (!item) continue;
      if (selectedSubtest === "ALL" || item.question.subtest === selectedSubtest) {
        indices.push(i);
      }
    }
    return indices;
  }, [orderedQuestions, selectedSubtest]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-mono text-base font-bold text-ink">
        Navigasi Soal (1–{orderedQuestions.length})
      </h2>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-2 rounded-[12px] border border-border-subtle bg-pill px-3 py-2.5 text-center text-xs font-semibold tabular-nums">
        <span className="text-accent-dark">{answeredCount} Terjawab</span>
        <span className="text-flag-text">{flaggedCount} Ragu</span>
        <span className="text-ink-secondary">{unansweredCount} Kosong</span>
      </div>

      {/* Subtest Filter Tabs (jika > 1 subtes, misal SKD Penuh) */}
      {subtestGroups.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter subtes">
          <button
            type="button"
            role="tab"
            aria-selected={selectedSubtest === "ALL"}
            onClick={() => setSelectedSubtest("ALL")}
            className={`min-h-[36px] rounded-[10px] border px-2.5 text-xs font-semibold transition-colors ${
              selectedSubtest === "ALL"
                ? "border-ink bg-accent-highlight text-ink"
                : "border-border-subtle bg-pill text-ink-secondary hover:text-ink"
            }`}
          >
            Semua
          </button>
          {subtestGroups.map((group) => {
            const isActive = selectedSubtest === group.subtest;
            return (
              <button
                key={group.subtest}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedSubtest(group.subtest)}
                className={`min-h-[36px] rounded-[10px] border px-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-ink bg-accent-highlight text-ink"
                    : "border-border-subtle bg-pill text-ink-secondary hover:text-ink"
                }`}
              >
                {group.subtest} ({group.startIndex + 1}–{group.endIndex + 1})
              </button>
            );
          })}
        </div>
      )}

      {/* Matrix Grid */}
      <div className="max-h-[420px] overflow-y-auto rounded-[14px] border border-border-subtle bg-pure p-3">
        <div className="grid grid-cols-5 gap-2">
          {visibleIndices.map((idx) => {
            const item = orderedQuestions[idx];
            if (!item) return null;
            const qId = item.question.id;
            const isCurrent = idx === currentIndex;
            const isFlagged = flaggedSet.has(qId);
            const isAnswered = answers[qId] !== undefined;

            let cellClass =
              "border-border-subtle bg-pure text-ink-secondary hover:border-ink hover:text-ink";
            if (isCurrent) {
              cellClass = "border-accent bg-accent text-white font-bold";
            } else if (isFlagged) {
              cellClass = "border-flag-border bg-flag-bg text-flag-text font-semibold";
            } else if (isAnswered) {
              cellClass = "border-accent bg-accent-soft text-accent-dark font-semibold";
            }

            return (
              <button
                key={qId}
                type="button"
                onClick={() => onSelectIndex(idx)}
                aria-label={`Soal nomor ${idx + 1}${isAnswered ? ", terjawab" : ", kosong"}${isFlagged ? ", ragu-ragu" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex min-h-[44px] items-center justify-center rounded-[10px] border-[1.5px] font-mono text-sm tabular-nums transition-colors ${cellClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-3 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-accent" aria-hidden="true" />
          Aktif
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border border-accent bg-accent-soft" aria-hidden="true" />
          Terjawab
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border border-flag-border bg-flag-bg" aria-hidden="true" />
          Ragu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border border-border-subtle bg-pure" aria-hidden="true" />
          Kosong
        </span>
      </div>
    </div>
  );
}
