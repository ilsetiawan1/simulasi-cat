import { SKD_DEFAULT_DURATION_MINUTES, SKD_PASSING_GRADE, SKD_TOTAL_QUESTIONS } from "@/constants/passing-grade";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-2xl font-bold tracking-tight text-ink">simcat</p>
      <h1 className="mt-6 font-mono text-4xl leading-tight text-ink md:text-5xl">
        Simulasi{" "}
        <span className="border-x-2 border-accent bg-accent-highlight px-2">
          CAT CPNS
        </span>{" "}
        sesuai standar BKN.
      </h1>
      <p className="mt-4 max-w-xl text-sm text-ink-secondary md:text-base">
        {SKD_TOTAL_QUESTIONS} soal SKD • Durasi {SKD_DEFAULT_DURATION_MINUTES} menit •
        Passing Grade TWK {SKD_PASSING_GRADE.TWK}, TIU {SKD_PASSING_GRADE.TIU}, TKP{" "}
        {SKD_PASSING_GRADE.TKP} (KepmenPANRB No. 321 Tahun 2024).
      </p>
    </main>
  );
}
