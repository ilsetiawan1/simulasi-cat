import { z } from "zod";

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
});

export type LastExamResultCache = z.infer<typeof lastExamResultSchema>;

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveLastExamResult(result: LastExamResultCache): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(
    `${LAST_RESULT_PREFIX}${result.packageSlug}`,
    JSON.stringify(result),
  );
}

export function loadLastExamResult(packageSlug: string): LastExamResultCache | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  const key = `${LAST_RESULT_PREFIX}${packageSlug}`;
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = lastExamResultSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function markLastExamResultSaved(packageSlug: string): void {
  const existing = loadLastExamResult(packageSlug);
  if (!existing) return;
  saveLastExamResult({ ...existing, savedToServer: true });
}
