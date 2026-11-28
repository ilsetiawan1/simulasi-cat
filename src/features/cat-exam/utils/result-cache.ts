import { z } from "zod";
import { examPackageRowSchema, questionRowSchema } from "@/lib/storage/exam-storage";

const LAST_RESULT_PREFIX = "simulasi_cat:last_result:";

export const lastExamResultSchema = z.object({
  version: z.literal(1),
  clientAttemptId: z.string().uuid(),
  packageId: z.string().uuid(),
  packageSlug: z.string().min(1),
  answers: z.record(z.string(), z.string()),
  questionOrder: z.array(z.string().uuid()),
  optionOrders: z.record(z.string(), z.array(z.string())),
  durationSeconds: z.number().int().min(1),
  completedAt: z.string().min(1),
  savedToServer: z.boolean(),
  package: examPackageRowSchema.optional(),
  questions: z.array(questionRowSchema).optional(),
});

export type LastExamResultCache = z.infer<typeof lastExamResultSchema>;

function getPreferredStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
}

function getFallbackSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveLastExamResult(
  result: LastExamResultCache,
  storage: Storage | null = getPreferredStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(
      `${LAST_RESULT_PREFIX}${result.packageSlug}`,
      JSON.stringify(result),
    );
  } catch {
    // Fallback ke sessionStorage jika localStorage penuh
    const fallback = getFallbackSessionStorage();
    if (fallback && fallback !== storage) {
      try {
        fallback.setItem(
          `${LAST_RESULT_PREFIX}${result.packageSlug}`,
          JSON.stringify(result),
        );
      } catch {
        // Abaikan jika kedua storage tidak tersedia
      }
    }
  }
}

export function loadLastExamResult(
  packageSlug: string,
  storage: Storage | null = getPreferredStorage(),
): LastExamResultCache | null {
  const key = `${LAST_RESULT_PREFIX}${packageSlug}`;
  const candidates: (Storage | null)[] = [storage];
  const fallback = getFallbackSessionStorage();
  if (fallback && fallback !== storage) {
    candidates.push(fallback);
  }

  for (const store of candidates) {
    if (!store) continue;
    const raw = store.getItem(key);
    if (!raw) continue;

    try {
      const parsed = lastExamResultSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        store.removeItem(key);
        continue;
      }
      return parsed.data;
    } catch {
      store.removeItem(key);
    }
  }

  return null;
}

export function markLastExamResultSaved(
  packageSlug: string,
  storage: Storage | null = getPreferredStorage(),
): void {
  const existing = loadLastExamResult(packageSlug, storage);
  if (!existing) return;
  saveLastExamResult({ ...existing, savedToServer: true }, storage);
}
