import { z } from "zod";
import type { ExamPackageRow, QuestionRow } from "@/lib/supabase/types";

const SESSION_KEY_PREFIX = "simulasi_cat:session:";
const SESSION_PAYLOAD_KEY_PREFIX = "simulasi_cat:session_payload:";
const PENDING_RESULT_KEY = "simulasi_cat:pending_result";

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  score: z.number(),
});

export const questionRowSchema = z.object({
  id: z.string().uuid(),
  package_id: z.string().uuid(),
  subtest: z.enum(["TWK", "TIU", "TKP", "SKB"]),
  question_text: z.string(),
  image_url: z.string().nullable(),
  options: z.array(questionOptionSchema),
  shuffle_options: z.boolean(),
  explanation: z.string(),
  created_at: z.string(),
});

export const examPackageRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string(),
  description: z.string(),
  category: z.enum(["SKD_FULL", "MINI_TWK", "MINI_TIU", "MINI_TKP", "SKB"]),
  duration_minutes: z.number(),
  total_questions: z.number(),
  passing_grade_twk: z.number().nullable(),
  passing_grade_tiu: z.number().nullable(),
  passing_grade_tkp: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const examSessionPayloadSchema = z.object({
  version: z.literal(1),
  package: examPackageRowSchema,
  questions: z.array(questionRowSchema),
});

export interface ExamSessionPayload {
  version: 1;
  package: ExamPackageRow;
  questions: QuestionRow[];
}

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

function getSessionPayloadKey(packageSlug: string): string {
  return `${SESSION_PAYLOAD_KEY_PREFIX}${packageSlug}`;
}

export function loadExamSessionPayload(
  packageSlug: string,
  storage: Storage | null = getDefaultStorage(),
): ExamSessionPayload | null {
  if (!storage) return null;
  const key = getSessionPayloadKey(packageSlug);
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = examSessionPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(key);
      return null;
    }
    return parsed.data as ExamSessionPayload;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function saveExamSessionPayload(
  packageSlug: string,
  payload: ExamSessionPayload,
  storage: Storage | null = getDefaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(getSessionPayloadKey(packageSlug), JSON.stringify(payload));
  } catch {
    // Abaikan jika kuota storage penuh atau private mode membatasi penulisan
  }
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
  storage.removeItem(getSessionPayloadKey(packageSlug));
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
