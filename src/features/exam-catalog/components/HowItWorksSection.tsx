import { TactileCard } from "@/components/ui";

const STEPS = [
  {
    number: "01",
    title: "Pilih Paket Tryout",
    description:
      "Pilih SKD Penuh (110 soal), Mini Tryout per subtes, atau SKB langsung sebagai Guest tanpa daftar akun.",
  },
  {
    number: "02",
    title: "Acak Soal & Opsi A-E",
    description:
      "Seluruh soal dimuat dalam 1x request lalu diacak dengan Fisher-Yates di dalam blok TWK, TIU, dan TKP.",
  },
  {
    number: "03",
    title: "Kerjakan CAT Real-Time",
    description:
      "Timer mundur 100 menit, tandai ragu-ragu, dan auto-save localStorage agar aman dari refresh browser.",
  },
  {
    number: "04",
    title: "Evaluasi & Peringkat",
    description:
      "Lihat rincian skor, status passing grade, pembahasan lengkap, lalu masuk untuk simpan ke Leaderboard.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
      <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
        CARA KERJA
      </p>
      <h2 className="mt-1 font-mono text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
        Empat langkah latihan realistis.
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <TactileCard key={step.number} shadow="sm" className="p-6">
            <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg bg-accent-highlight font-mono text-sm font-bold text-ink">
              {step.number}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {step.description}
            </p>
          </TactileCard>
        ))}
      </div>
    </section>
  );
}
