import type { QuestionSubtest } from "@/constants/passing-grade";

export type ExamCategory = "SKD_FULL" | "MINI_TWK" | "MINI_TIU" | "MINI_TKP" | "SKB";

export interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamPackageRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ExamCategory;
  duration_minutes: number;
  total_questions: number;
  passing_grade_twk: number | null;
  passing_grade_tiu: number | null;
  passing_grade_tkp: number | null;
  is_active: boolean;
  created_at: string;
}

export interface QuestionRow {
  id: string;
  package_id: string;
  subtest: QuestionSubtest;
  question_text: string;
  image_url: string | null;
  options: QuestionOption[];
  shuffle_options: boolean;
  explanation: string;
  created_at: string;
}

export interface ScoreRow {
  id: string;
  user_id: string;
  package_id: string;
  client_attempt_id: string;
  score_twk: number;
  score_tiu: number;
  score_tkp: number;
  score_skb: number;
  total_score: number;
  is_passed: boolean;
  duration_seconds: number;
  completed_at: string;
}
