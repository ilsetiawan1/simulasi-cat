// Standar Ambang Batas SKD CPNS — KepmenPANRB No. 321 Tahun 2024
export const SKD_SUBTEST_ORDER = ["TWK", "TIU", "TKP"] as const;

export type SkdSubtest = (typeof SKD_SUBTEST_ORDER)[number];
export type QuestionSubtest = SkdSubtest | "SKB";

export const SKD_QUESTION_COUNTS: Record<SkdSubtest, number> = {
  TWK: 30,
  TIU: 35,
  TKP: 45,
};

export const SKD_TOTAL_QUESTIONS = 110;
export const SKD_DEFAULT_DURATION_MINUTES = 100;

export const SKD_MAX_SCORE = {
  TWK: 150,
  TIU: 175,
  TKP: 225,
  TOTAL: 550,
} as const;

export const SKD_PASSING_GRADE = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
  TOTAL: 311,
} as const;
