import { z } from "zod";

const SESSION_KEY_PREFIX = "simulasi_cat:session:";
const PENDING_RESULT_KEY = "simulasi_cat:pending_result";

export const examSessionStateSchema = z.object({
  version: z.literal(1),
  clientAttemptId: z.string().uuid(),
  packageId: z.string().uuid(),
  packageSlug: z.string().min(1),
  startedAt: z.number().int().nonnegative(),
  endTimestamp: z.number().int().nonnegative(),
  currentIndex: z.number().int().nonnegative(),
  questionOrder: z.array(z.string().uuid()),
  optionOrders: z.record(z.string(), z.array(z.string())),
  answers: z.record(z.string(), z.string()),
  flaggedIds: z.array(z.string()),
});

export type ExamSessionState = z.infer<typeof examSessionStateSchema>;

export const pendingGuestResultSchema = z.object({
  version: z.literal(1),
  clientAttemptId: z.string().uuid(),
  packageId: z.string().uuid(),
  packageSlug: z.string().min(1),
  answers: z.record(z.string(), z.string()),
  durationSeconds: z.number().int().nonnegative(),
  completedAt: z.string().min(1),
});

export type PendingGuestResult = z.infer<typeof pendingGuestResultSchema>;

function getDefaultStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function getSessionKey(packageSlug: string): string {
  return `${SESSION_KEY_PREFIX}${packageSlug}`;
}

export function loadExamSession(
  packageSlug: string,
  storage: Storage | null = getDefaultStorage(),
): ExamSessionState | null {
  if (!storage) return null;
  const key = getSessionKey(packageSlug);
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = examSessionStateSchema.safeParse(JSON.parse(raw));
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

export function saveExamSession(
  session: ExamSessionState,
  storage: Storage | null = getDefaultStorage(),
): void {
  if (!storage) return;
  storage.setItem(getSessionKey(session.packageSlug), JSON.stringify(session));
}

export function clearExamSession(
  packageSlug: string,
  storage: Storage | null = getDefaultStorage(),
): void {
  if (!storage) return;
  storage.removeItem(getSessionKey(packageSlug));
}

export function loadPendingGuestResult(
  storage: Storage | null = getDefaultStorage(),
): PendingGuestResult | null {
  if (!storage) return null;
  const raw = storage.getItem(PENDING_RESULT_KEY);
  if (!raw) return null;

  try {
    const parsed = pendingGuestResultSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(PENDING_RESULT_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    storage.removeItem(PENDING_RESULT_KEY);
    return null;
  }
}

export function savePendingGuestResult(
  result: PendingGuestResult,
  storage: Storage | null = getDefaultStorage(),
): void {
  if (!storage) return;
  storage.setItem(PENDING_RESULT_KEY, JSON.stringify(result));
}

export function clearPendingGuestResult(
  storage: Storage | null = getDefaultStorage(),
): void {
  if (!storage) return;
  storage.removeItem(PENDING_RESULT_KEY);
}
