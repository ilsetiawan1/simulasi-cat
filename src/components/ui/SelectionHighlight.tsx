"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

interface SelectionHighlightProps {
  children: ReactNode;
  showHandles?: boolean;
  animate?: boolean;
  className?: string;
}

export function SelectionHighlight({
  children,
  showHandles = true,
  animate = false,
  className = "",
}: SelectionHighlightProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (!animate || !rootRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const boxWidth = rootRef.current?.offsetWidth ?? 0;
        if (boxWidth <= 0) return;

        const tl = gsap.timeline({
          delay: 0.28,
          repeat: 2, // Total 3x putaran (1 awal + 2 pengulangan), reset otomatis saat pindah halaman/refresh
          repeatDelay: 5,
        });

        // Reset ke kondisi awal setiap awal iterasi agar pengulangan selalu mulus dari kiri ke kanan
        tl.set("[data-sel-bg]", { scaleX: 0, transformOrigin: "left center" })
          .set("[data-sel-left]", {
            opacity: 0,
            scaleY: 0.35,
            transformOrigin: "center center",
          })
          .set("[data-sel-right]", { x: -boxWidth, opacity: 0 })
          .set("[data-sel-cursor]", { opacity: 0, y: 0, scale: 0.85 })
          // 1. Kursor muncul & menempel di awal kata
          .to("[data-sel-cursor]", {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          })
          .to(
            "[data-sel-left]",
            {
              opacity: 1,
              scaleY: 1,
              duration: 0.16,
              ease: "power2.out",
            },
            "<+0.04",
          )
          .set("[data-sel-right]", { opacity: 1 })
          // 2. Drag seleksi dari kiri ke kanan (GPU transform: scaleX + translateX)
          .to("[data-sel-bg]", {
            scaleX: 1,
            duration: 0.72,
            ease: "power2.inOut",
          })
          .to(
            "[data-sel-right]",
            {
              x: 0,
              duration: 0.72,
              ease: "power2.inOut",
            },
            "<",
          )
          // 3. Kursor dilepas dan memudar halus setelah seleksi selesai
          .to("[data-sel-cursor]", {
            opacity: 0,
            y: 6,
            duration: 0.32,
            delay: 0.18,
            ease: "power2.in",
          });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [animate] },
  );

  return (
    <span
      ref={rootRef}
      className={`relative inline-block px-3 py-0.5 text-ink ${className}`.trim()}
    >
      {/* Lapisan sorotan hijau seleksi */}
      <span
        data-sel-bg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-accent-highlight will-change-transform"
      />

      {/* Garis batas kiri + handle atas */}
      <span
        data-sel-left
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[2.5px] bg-accent will-change-transform"
      >
        {showHandles && (
          <span className="absolute -left-[4px] -top-[5px] h-2.5 w-2.5 rounded-full bg-accent" />
        )}
      </span>

      {/* Garis batas kanan + handle bawah + kursor drag sementara */}
      <span
        data-sel-right
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[2.5px] bg-accent will-change-transform"
      >
        {showHandles && (
          <span className="absolute -bottom-[5px] -right-[4px] h-2.5 w-2.5 rounded-full bg-accent" />
        )}
        {animate && (
          <svg
            data-sel-cursor
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute -bottom-[20px] -right-[14px] opacity-0 drop-shadow-[0_1px_1px_rgba(24,24,22,0.25)] will-change-transform"
          >
            <path
              d="M5 3L19 11.5L12.2 13.4L9.2 19.8L5 3Z"
              fill="#FAF9F5"
              stroke="#181816"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Teks selalu di atas lapisan highlight */}
      <span className="relative z-10">{children}</span>
    </span>
  );
}
