"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";
import { SelectionHighlight, TactileCard, buttonClasses } from "@/components/ui";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        tl.from("[data-hero-pill]", {
          y: 12,
          opacity: 0,
          duration: 0.45,
          delay: 0.12,
        }).from(
          "[data-hero-card]",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            clearProps: "transform",
          },
          "-=0.22",
        );
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="mx-auto max-w-[1280px] px-4 pt-10 pb-14 sm:px-8 lg:px-12 lg:pt-14 lg:pb-20"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-mono text-[30px] leading-[1.25] tracking-[-0.025em] text-ink sm:text-[42px] lg:text-[52px] lg:leading-[1.2]">
          Simulasi{" "}
          <SelectionHighlight animate className="my-1">
            CAT CPNS
          </SelectionHighlight>
          <span className="mt-1 block">sesuai standar BKN.</span>
        </h1>

        {/* Floating Quick-Action Pill Bar */}
        <div
          data-hero-pill
          className="mx-auto mt-8 flex max-w-[680px] flex-col items-stretch justify-between gap-3 rounded-[14px] bg-pill p-2.5 sm:flex-row sm:items-center sm:px-5 sm:py-2"
        >
          <div className="hidden flex-1 items-center justify-center gap-4 text-[13px] font-medium text-ink-secondary sm:flex">
            <span>Tanpa Wajib Login</span>
            <span aria-hidden="true" className="h-4 w-px bg-border-subtle" />
            <span>Acak Soal &amp; Opsi A-E</span>
            <span aria-hidden="true" className="h-4 w-px bg-border-subtle" />
            <span>Auto-Save Sesi</span>
          </div>
          <Link
            href="#katalog"
            className={buttonClasses("primary", "rounded", "w-full sm:w-auto sm:px-6")}
          >
            Mulai SKD →
          </Link>
        </div>
      </div>

      {/* 3 Iconic Editorial Feature Cards */}
      <div className="mx-auto mt-12 grid max-w-[1040px] grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16 lg:items-start lg:gap-8">
        {/* Card 1 */}
        <div data-hero-card>
          <TactileCard className="p-6 text-center transition-transform lg:-rotate-2 lg:hover:rotate-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              ZERO-FRICTION MODE
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-snug text-ink lg:text-xl">
              Langsung latihan, tanpa wajib daftar
            </h2>
            <div className="mt-6 flex justify-center">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="text-ink"
              >
                <path
                  d="M20 75H120L130 92H10L20 75Z"
                  fill="#EAE8E1"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <rect
                  x="30"
                  y="22"
                  width="80"
                  height="53"
                  fill="#FAF9F5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M52 47L64 59L88 37M18 14L24 20M122 14L116 20M70 8V15"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </TactileCard>
        </div>

        {/* Card 2 (Foreground Center) */}
        <div data-hero-card>
          <TactileCard className="p-6 text-center lg:translate-y-5">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              ANTI-HAFAL SOAL
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-snug text-ink lg:text-xl">
              Acak soal &amp; opsi di setiap sesi
            </h2>
            <div className="mt-6 flex justify-center">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="text-ink"
              >
                <path
                  d="M18 94H46V72H76V50H108V28H130"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M36 44L84 16L94 32L46 60L30 58L36 44Z"
                  fill="#EAE8E1"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M78 20L88 36"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </TactileCard>
        </div>

        {/* Card 3 */}
        <div data-hero-card>
          <TactileCard className="p-6 text-center transition-transform lg:rotate-2 lg:hover:rotate-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              STANDAR BKN 2024
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-snug text-ink lg:text-xl">
              Skor &amp; pembahasan otomatis instan
            </h2>
            <div className="mt-6 flex justify-center">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="text-ink"
              >
                <path
                  d="M40 20H100L94 58C92 72 82 80 70 80C58 80 48 72 46 58L40 20Z"
                  fill="#EAE8E1"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 28H24C24 46 32 54 44 54M100 28H116C116 46 108 54 96 54M70 80V96M48 96H92M58 46L68 56L84 38"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </TactileCard>
        </div>
      </div>
    </section>
  );
}
