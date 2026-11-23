"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { markLastExamResultSaved } from "@/features/cat-exam";
import { submitExamScoreRequest } from "@/features/exam-result";
import {
  clearPendingGuestResult,
  loadPendingGuestResult,
} from "@/lib/storage/exam-storage";

export interface HandoffNotice {
  packageSlug: string;
  totalScore: number;
}

/**
 * Mendeteksi pending skor Guest di localStorage setelah pengguna login,
 * mengirimkannya otomatis ke POST /api/scores (idempotent), lalu menghapus
 * pending data agar tidak pernah dikirim ulang.
 */
export function useGuestScoreHandoff(user: User | null) {
  const [notice, setNotice] = useState<HandoffNotice | null>(null);
  const processedAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const pending = loadPendingGuestResult();
    if (!pending) return;
    if (processedAttemptRef.current === pending.clientAttemptId) return;

    processedAttemptRef.current = pending.clientAttemptId;
    let active = true;

    async function syncPendingScore() {
      try {
        const safeDuration = Math.min(Math.max(1, pending!.durationSeconds), 86400);
        const outcome = await submitExamScoreRequest({
          packageId: pending!.packageId,
          clientAttemptId: pending!.clientAttemptId,
          answers: pending!.answers,
          durationSeconds: safeDuration,
        });

        if (!active) return;

        if (outcome.status === "saved") {
          clearPendingGuestResult();
          markLastExamResultSaved(pending!.packageSlug);
          setNotice({
            packageSlug: pending!.packageSlug,
            totalScore: outcome.score.total_score,
          });
        }
      } catch {
        // Biarkan pending_result tetap ada agar dapat dicoba ulang di kunjungan berikutnya
        processedAttemptRef.current = null;
      }
    }

    syncPendingScore();
    return () => {
      active = false;
    };
  }, [user]);

  return {
    notice,
    dismissNotice: () => setNotice(null),
  };
}
