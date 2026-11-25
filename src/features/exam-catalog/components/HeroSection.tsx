"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectionHighlight, TactileCard, buttonClasses } from "@/components/ui";

gsap.registerPlugin(useGSAP);

const HERO_SLIDE_COUNT = 3;
const AUTO_SLIDE_MS = 3800;

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const activeSlideRef = useRef(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = useCallback((index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>("[data-hero-card]");
    const target = slides[index];
    if (!target) return;
    activeSlideRef.current = index;
    setActiveSlide(index);
    container.scrollTo({
      left: Math.max(0, target.offsetLeft - container.offsetLeft),
      behavior: "smooth",
    });
  }, []);

  const handleCarouselScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>("[data-hero-card]");
    if (slides.length === 0) return;

    const currentLeft = container.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, idx) => {
      const slideLeft = Math.max(0, slide.offsetLeft - container.offsetLeft);
      const distance = Math.abs(slideLeft - currentLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeSlideRef.current) {
      activeSlideRef.current = closestIndex;
      setActiveSlide(closestIndex);
    }
  }, []);

  const pauseAutoSlide = useCallback(() => {
    isPausedRef.current = true;
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const resumeAutoSlideDelayed = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = window.setTimeout(() => {
      isPausedRef.current = false;
      pauseTimerRef.current = null;
    }, 5000);
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 767px)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const intervalId = window.setInterval(() => {
      if (!mobileMq.matches || reducedMotionMq.matches || isPausedRef.current) {
        return;
      }
      const next = (activeSlideRef.current + 1) % HERO_SLIDE_COUNT;
      scrollToSlide(next);
    }, AUTO_SLIDE_MS);

    return () => {
      window.clearInterval(intervalId);
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }
    };
  }, [scrollToSlide]);

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
      className="mx-auto max-w-[1280px] px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-14 lg:px-12 lg:pt-14 lg:pb-20"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-mono text-[28px] leading-[1.24] tracking-[-0.025em] text-ink sm:text-[42px] lg:text-[52px] lg:leading-[1.2]">
          Simulasi{" "}
          <SelectionHighlight animate className="my-1">
            CAT CPNS
          </SelectionHighlight>
          <span className="mt-1 block">sesuai standar BKN.</span>
        </h1>

        {/* Floating Quick-Action Pill Bar */}
        <div
          data-hero-pill
          className="mx-auto mt-5 flex max-w-[680px] flex-col items-stretch justify-between gap-3 rounded-[14px] bg-pill p-2 sm:mt-8 sm:flex-row sm:items-center sm:px-5 sm:py-2"
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

      {/* 3 Iconic Editorial Feature Cards: Auto-sliding Carousel on Mobile -> 3-Col Grid on Tablet/Desktop */}
      <div
        ref={carouselRef}
        onScroll={handleCarouselScroll}
        onTouchStart={pauseAutoSlide}
        onTouchEnd={resumeAutoSlideDelayed}
        onPointerDown={pauseAutoSlide}
        onPointerUp={resumeAutoSlideDelayed}
        className="mx-auto mt-6 flex max-w-[1040px] snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 lg:mt-16 lg:items-start lg:gap-8"
      >
        {/* Card 1 */}
        <div data-hero-card className="w-[82%] shrink-0 snap-start md:w-auto md:shrink">
          <TactileCard className="p-4 text-center transition-transform md:p-6 lg:-rotate-2 lg:hover:rotate-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              ZERO-FRICTION MODE
            </p>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink md:mt-2 md:text-lg lg:text-xl">
              Langsung latihan, tanpa wajib daftar
            </h2>
            <div className="mt-3 flex justify-center md:mt-6">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="h-[64px] w-auto text-ink md:h-[96px]"
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
        <div data-hero-card className="w-[82%] shrink-0 snap-start md:w-auto md:shrink">
          <TactileCard className="p-4 text-center md:p-6 lg:translate-y-5">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              ANTI-HAFAL SOAL
            </p>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink md:mt-2 md:text-lg lg:text-xl">
              Acak soal &amp; opsi di setiap sesi
            </h2>
            <div className="mt-3 flex justify-center md:mt-6">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="h-[64px] w-auto text-ink md:h-[96px]"
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
        <div data-hero-card className="w-[82%] shrink-0 snap-start md:w-auto md:shrink">
          <TactileCard className="p-4 text-center transition-transform md:p-6 lg:rotate-2 lg:hover:rotate-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              STANDAR BKN 2024
            </p>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink md:mt-2 md:text-lg lg:text-xl">
              Skor &amp; pembahasan otomatis instan
            </h2>
            <div className="mt-3 flex justify-center md:mt-6">
              <svg
                width="128"
                height="96"
                viewBox="0 0 140 104"
                fill="none"
                aria-hidden="true"
                className="h-[64px] w-auto text-ink md:h-[96px]"
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

      {/* Mobile Carousel Pagination Dots */}
      <div
        className="mt-2 flex items-center justify-center gap-1 md:hidden"
        role="tablist"
        aria-label="Navigasi fitur utama"
      >
        {[0, 1, 2].map((index) => {
          const isActive = activeSlide === index;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Fitur ${index + 1}`}
              onClick={() => {
                pauseAutoSlide();
                scrollToSlide(index);
                resumeAutoSlideDelayed();
              }}
              className="flex min-h-[28px] items-center justify-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? "w-5 bg-accent" : "w-1.5 bg-border-subtle"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
