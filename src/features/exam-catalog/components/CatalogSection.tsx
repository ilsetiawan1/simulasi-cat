"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, EmptyState, TactileCard, buttonClasses } from "@/components/ui";
import type { ExamCategory, ExamPackageRow } from "@/lib/supabase/types";
import { fetchActivePackages } from "../api/packages.api";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type FilterOption = "ALL" | "SKD_FULL" | "MINI" | "SKB";

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "SKD_FULL", label: "SKD Penuh" },
  { value: "MINI", label: "Latihan Subtes" },
  { value: "SKB", label: "SKB" },
];

function getCategoryLabel(category: ExamCategory): string {
  if (category === "SKD_FULL") return "SKD PENUH · STANDAR BKN";
  if (category === "MINI_TWK") return "LATIHAN SUBTES · TWK";
  if (category === "MINI_TIU") return "LATIHAN SUBTES · TIU";
  if (category === "MINI_TKP") return "LATIHAN SUBTES · TKP";
  return "SKB · SEGERA HADIR";
}

function matchesFilter(pkg: ExamPackageRow, filter: FilterOption): boolean {
  if (filter === "ALL") return true;
  if (filter === "MINI") return pkg.category.startsWith("MINI_");
  return pkg.category === filter;
}

export function CatalogSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [packages, setPackages] = useState<ExamPackageRow[]>([]);
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [skbQuery, setSkbQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPackages() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivePackages();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat katalog paket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setFilter("SKD_FULL");
    }
    void loadPackages();
  }, []);

  const skbPackagesCount = packages.filter((pkg) => pkg.category === "SKB").length;
  const showSkbSearch = filter === "SKB" && skbPackagesCount >= 4;
  const normalizedQuery = skbQuery.trim().toLowerCase();

  const visiblePackages = packages.filter((pkg) => {
    if (!matchesFilter(pkg, filter)) return false;
    if (showSkbSearch && normalizedQuery.length > 0) {
      return (
        pkg.title.toLowerCase().includes(normalizedQuery) ||
        pkg.description.toLowerCase().includes(normalizedQuery)
      );
    }
    return true;
  });

  // Scroll reveal untuk header & tab filter Katalog Tryout
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 86%",
            once: true,
          },
        });

        tl.from("[data-catalog-head]", {
          y: 18,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "transform",
        }).from(
          "[data-catalog-tabs]",
          {
            y: 14,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.25",
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Stagger reveal untuk kartu paket saat selesai dimuat atau saat ganti filter
  useGSAP(
    () => {
      if (loading || error || visiblePackages.length === 0 || !gridRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-catalog-card]", {
          y: 22,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 88%",
            once: true,
          },
        });
      });

      // Refresh ScrollTrigger agar section Cara Kerja di bawahnya membaca tinggi terbaru
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: gridRef, dependencies: [loading, filter, visiblePackages.length], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="katalog"
      className="mx-auto max-w-[1280px] scroll-mt-10 px-4 py-8 sm:px-8 sm:py-14 lg:px-12 lg:py-20"
    >
      <div
        data-catalog-head
        className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
            KATALOG TRYOUT
          </p>
          <h2 className="mt-1 font-mono text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
            Pilih mode ujian kamu.
          </h2>
        </div>
        <p className="max-w-md text-sm text-ink-secondary md:text-right">
          {filter === "MINI"
            ? "Latihan fokus per materi. Skor tersimpan di Riwayat pribadi (tidak masuk Papan Peringkat)."
            : filter === "SKB"
              ? "Simulasi SKB formasi jabatan sedang disiapkan dan akan segera hadir."
              : "Semua tryout gratis untuk Guest. Skor SKD Penuh masuk Papan Peringkat saat login."}
        </p>
      </div>

      {/* Category Filter Tabs + Auto-Search Formasi SKB (muncul otomatis saat SKB >= 4) */}
      <div
        data-catalog-tabs
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setFilter(item.value);
                  if (item.value !== "SKB") setSkbQuery("");
                }}
                className={`min-h-[42px] shrink-0 whitespace-nowrap rounded-[10px] px-3.5 text-xs font-semibold transition-colors sm:min-h-[44px] sm:px-4 ${
                  active
                    ? "border-[1.5px] border-ink bg-accent-highlight text-ink"
                    : "border border-border-subtle bg-pill text-ink-secondary hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {showSkbSearch && (
          <div className="w-full sm:w-[280px]">
            <label htmlFor="catalog-skb-search" className="sr-only">
              Cari formasi jabatan SKB
            </label>
            <input
              id="catalog-skb-search"
              type="search"
              value={skbQuery}
              onChange={(e) => setSkbQuery(e.target.value)}
              placeholder="Cari formasi jabatan..."
              className="min-h-[44px] w-full rounded-[10px] border-[1.5px] border-ink bg-pure px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div
          aria-live="polite"
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[0, 1, 2].map((skeleton) => (
            <TactileCard key={skeleton} shadow="sm" className="p-6">
              <div className="h-4 w-36 animate-pulse rounded bg-pill" />
              <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-pill" />
              <div className="mt-3 h-12 w-full animate-pulse rounded bg-pill" />
              <div className="mt-5 h-20 w-full animate-pulse rounded-xl bg-pill" />
              <div className="mt-5 h-11 w-full animate-pulse rounded-[10px] bg-pill" />
            </TactileCard>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-8">
          <EmptyState
            tone="error"
            title="Gagal memuat paket tryout"
            description={error}
            action={<Button onClick={() => void loadPackages()}>Coba Muat Ulang</Button>}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && visiblePackages.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Belum ada paket pada kategori ini"
            description="Pilih kategori lain atau tampilkan semua paket tryout aktif."
            action={
              <Button variant="outline" onClick={() => setFilter("ALL")}>
                Tampilkan Semua Paket
              </Button>
            }
          />
        </div>
      )}

      {/* Package Grid: 1-col Mobile -> 2-col Tablet -> 3-col Desktop */}
      {!loading && !error && visiblePackages.length > 0 && (
        <div
          ref={gridRef}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visiblePackages.map((pkg) => {
            const isFeatured = pkg.category === "SKD_FULL";
            return (
              <div key={pkg.id} data-catalog-card className="flex">
                <TactileCard
                  borderStrong={isFeatured}
                  className="flex w-full flex-col overflow-hidden"
                >
                  {/* Header strip seragam di semua kartu agar judul & deskripsi sejajar horizontal */}
                  <div
                    className={`flex min-h-[38px] items-center border-b px-6 py-2 font-mono uppercase ${
                      isFeatured
                        ? "border-ink/20 bg-accent-highlight text-xs font-bold text-ink"
                        : "border-border-subtle/70 bg-pill/45 text-[11px] font-semibold tracking-[0.06em] text-ink-muted"
                    }`}
                  >
                    {getCategoryLabel(pkg.category)}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold text-ink">{pkg.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                      {pkg.description}
                    </p>

                    {/* Footer terpadu (kotak metadata + CTA) agar selalu sejajar di Desktop & Tablet */}
                    <div className="mt-auto flex flex-col gap-4 pt-5">
                      <div className="flex min-h-[76px] flex-col justify-center rounded-xl bg-pill p-4 font-mono text-xs text-ink">
                        <p className="font-bold">
                          {pkg.total_questions} Soal &bull; {pkg.duration_minutes} Menit
                        </p>
                        {pkg.category === "SKD_FULL" && (
                          <p className="mt-1.5 font-bold text-accent-dark">
                            PG: TWK {pkg.passing_grade_twk ?? 65} | TIU{" "}
                            {pkg.passing_grade_tiu ?? 80} | TKP {pkg.passing_grade_tkp ?? 166}
                          </p>
                        )}
                        {pkg.category === "MINI_TWK" && (
                          <p className="mt-1.5 text-ink-secondary">
                            Ambang Batas TWK: {pkg.passing_grade_twk ?? 65} (Benar +5, Salah 0)
                          </p>
                        )}
                        {pkg.category === "MINI_TIU" && (
                          <p className="mt-1.5 text-ink-secondary">
                            Ambang Batas TIU: {pkg.passing_grade_tiu ?? 80} (Benar +5, Salah 0)
                          </p>
                        )}
                        {pkg.category === "MINI_TKP" && (
                          <p className="mt-1.5 text-ink-secondary">
                            Ambang Batas TKP: {pkg.passing_grade_tkp ?? 166} (Skala 1 s.d. 5)
                          </p>
                        )}
                        {pkg.category === "SKB" && (
                          <p className="mt-1.5 text-ink-secondary">
                            Penilaian: Benar +5 &bull; Salah / Kosong 0
                          </p>
                        )}
                      </div>

                      {pkg.category === "SKB" ? (
                        <button
                          type="button"
                          disabled
                          className={buttonClasses(
                            "outline",
                            "rounded",
                            "w-full cursor-not-allowed opacity-60",
                          )}
                        >
                          Segera Hadir
                        </button>
                      ) : (
                        <Link
                          href={`/packages/${pkg.slug}`}
                          className={buttonClasses(
                            isFeatured ? "primary" : "outline",
                            "rounded",
                            "w-full",
                          )}
                        >
                          {isFeatured ? "Mulai SKD Penuh →" : "Lihat Aturan & Mulai →"}
                        </Link>
                      )}
                    </div>
                  </div>
                </TactileCard>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
