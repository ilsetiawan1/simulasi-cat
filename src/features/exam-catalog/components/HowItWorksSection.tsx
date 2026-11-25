"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { TactileCard } from "@/components/ui";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    number: "01",
    title: "Pilih Mode Ujian",
    description:
      "Mulai Tryout SKD Penuh (110 soal) atau Latihan Subtes TWK, TIU, dan TKP langsung gratis tanpa wajib daftar akun.",
  },
  {
    number: "02",
    title: "Acak Soal & Opsi A-E",
    description:
      "Kombinasi soal dan urutan pilihan jawaban diacak otomatis di setiap sesi, dengan urutan blok SKD tetap TWK, TIU, lalu TKP.",
  },
  {
    number: "03",
    title: "Kerjakan CAT Real-Time",
    description:
      "Dilengkapi timer mundur standar BKN, penanda ragu-ragu, dan penyimpanan otomatis agar jawaban tetap aman saat halaman di-refresh.",
  },
  {
    number: "04",
    title: "Evaluasi & Peringkat",
    description:
      "Lihat rincian skor, status passing grade, dan pembahasan lengkap tiap soal, lalu masuk untuk menyimpan skormu ke Papan Peringkat.",
  },
] as const;

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        });

        tl.from("[data-steps-head]", {
          y: 16,
          opacity: 0,
          duration: 0.42,
          ease: "power2.out",
          clearProps: "transform",
        }).from(
          "[data-step-card]",
          {
            y: 22,
            opacity: 0,
            duration: 0.45,
            stagger: 0.09,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.2",
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[1280px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20"
    >
      <div data-steps-head>
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          CARA KERJA
        </p>
        <h2 className="mt-1 font-mono text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
          Empat langkah latihan realistis.
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number} data-step-card>
            <TactileCard shadow="sm" className="h-full p-6">
              <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg bg-accent-highlight font-mono text-sm font-bold text-ink">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {step.description}
              </p>
            </TactileCard>
          </div>
        ))}
      </div>
    </section>
  );
}
