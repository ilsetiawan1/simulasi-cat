"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

interface PageRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper GSAP ringkas untuk entrance staggered yang cepat & smooth
 * saat halaman dimuat atau di-refresh. Otomatis menghormati prefers-reduced-motion.
 */
export function PageReveal({ children, className = "" }: PageRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = containerRef.current?.querySelectorAll("[data-reveal]");
        if (!targets || targets.length === 0) return;

        gsap.from(targets, {
          y: 14,
          opacity: 0,
          duration: 0.36,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
