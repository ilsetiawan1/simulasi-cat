"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Button,
  EmptyState,
  SelectionHighlight,
  TactileCard,
  buttonClasses,
} from "@/components/ui";
import { fetchActivePackages } from "@/features/exam-catalog";
import type { ExamPackageRow } from "@/lib/supabase/types";
import type { LeaderboardEntry } from "@/modules/scores/scores.service";
import { fetchLeaderboard } from "../api/leaderboard.api";

function formatRank(rank: number): string {
  return rank < 10 ? `#0${rank}` : `#${rank}`;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  if (parts.length === 0) return "PS";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function ParticipantAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full border-[1.5px] border-border-subtle bg-accent-soft">
      {avatarUrl && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-mono text-xs font-bold text-accent-dark">
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}

export function LeaderboardView() {
  const [packages, setPackages] = useState<ExamPackageRow[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? null;

  async function loadPackages() {
    setLoadingPackages(true);
    setError(null);
    try {
      const list = await fetchActivePackages();
      setPackages(list);
      const first = list[0];
      if (first) {
        setSelectedPackageId(first.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar paket.");
    } finally {
      setLoadingPackages(false);
    }
  }

  async function loadBoard(packageId: string) {
    setLoadingBoard(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(packageId, 50);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat papan peringkat.");
    } finally {
      setLoadingBoard(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      void loadBoard(selectedPackageId);
    }
  }, [selectedPackageId]);

  const isSkb = selectedPackage?.category === "SKB";

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-8 pb-16 sm:px-8 lg:px-12 lg:pt-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-mono text-2xl tracking-[-0.02em] text-ink sm:text-3xl lg:text-4xl">
            Papan{" "}
            <SelectionHighlight showHandles={false}>Peringkat</SelectionHighlight>
          </h1>
          <p className="mt-3 text-sm text-ink-secondary">
            Urutan tie-breaker BKN: Total Skor &rarr; TKP &rarr; TIU &rarr; TWK &rarr;
            Waktu Submit Tercepat.
          </p>
        </div>

        <div className="w-full md:w-[340px]">
          <label
            htmlFor="leaderboard-package-select"
            className="mb-1.5 block text-xs font-semibold text-ink-secondary"
          >
            Pilih Paket Tryout
          </label>
          <select
            id="leaderboard-package-select"
            value={selectedPackageId}
            disabled={loadingPackages || packages.length === 0}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border-[1.5px] border-ink bg-card px-3.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {packages.length === 0 ? (
              <option value="">Memuat paket...</option>
            ) : (
              packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {(loadingPackages || loadingBoard) && (
        <TactileCard className="mt-8 p-6" shadow="sm">
          <div className="space-y-3" aria-live="polite">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-12 w-full animate-pulse rounded-xl bg-pill" />
            ))}
          </div>
        </TactileCard>
      )}

      {/* Error State */}
      {!loadingPackages && !loadingBoard && error && (
        <div className="mt-8">
          <EmptyState
            tone="error"
            title="Gagal memuat papan peringkat"
            description={error}
            action={
              <Button
                onClick={() =>
                  selectedPackageId ? void loadBoard(selectedPackageId) : void loadPackages()
                }
              >
                Coba Lagi
              </Button>
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!loadingPackages && !loadingBoard && !error && entries.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Belum ada skor tercatat untuk paket ini"
            description="Selesaikan tryout dan masuk ke akunmu untuk menjadi peserta pertama di Papan Peringkat paket ini."
            action={
              selectedPackage ? (
                <Link
                  href={`/packages/${selectedPackage.slug}`}
                  className={buttonClasses("primary")}
                >
                  Mulai Paket Ini →
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Data Views */}
      {!loadingPackages && !loadingBoard && !error && entries.length > 0 && (
        <>
          {/* Mobile Cards (zero horizontal overflow) */}
          <div className="mt-8 space-y-4 md:hidden">
            {entries.map((entry) => {
              const isTop = entry.rank === 1;
              return (
                <TactileCard
                  key={entry.scoreId}
                  shadow="sm"
                  className={`p-4 ${isTop ? "bg-accent-soft" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ParticipantAvatar
                        name={entry.displayName}
                        avatarUrl={entry.avatarUrl}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          <span className="mr-1.5 font-mono font-bold text-accent-dark">
                            {formatRank(entry.rank)}
                          </span>
                          {entry.displayName}
                        </p>
                        <p className="mt-0.5 font-mono text-xs tabular-nums text-ink-secondary">
                          {isSkb
                            ? `SKB ${entry.scoreSkb}`
                            : `TWK ${entry.scoreTwk} • TIU ${entry.scoreTiu} • TKP ${entry.scoreTkp}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-xl font-bold tabular-nums text-ink">
                      {entry.totalScore}
                    </p>
                  </div>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      entry.isPassed ? "text-accent-dark" : "text-danger-text"
                    }`}
                  >
                    {entry.isPassed ? "Lulus Passing Grade" : "Tidak Lulus Passing Grade"}
                  </p>
                </TactileCard>
              );
            })}
          </div>

          {/* Tablet & Desktop Table (Warm Paper #EAE8E1 Header) */}
          <TactileCard className="mt-8 hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-pill font-mono text-xs font-bold text-ink">
                    <th className="px-6 py-4">RANK</th>
                    <th className="px-4 py-4">PESERTA</th>
                    {!isSkb && <th className="px-4 py-4 text-right">TWK (65)</th>}
                    {!isSkb && <th className="px-4 py-4 text-right">TIU (80)</th>}
                    {!isSkb && <th className="px-4 py-4 text-right">TKP (166)</th>}
                    {isSkb && <th className="px-4 py-4 text-right">SKB</th>}
                    <th className="px-4 py-4 text-right text-accent-dark">TOTAL SKOR</th>
                    <th className="px-6 py-4 text-right">STATUS PG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-sm">
                  {entries.map((entry) => {
                    const isTop = entry.rank === 1;
                    return (
                      <tr key={entry.scoreId} className={isTop ? "bg-accent-soft" : ""}>
                        <td
                          className={`px-6 py-4 font-mono font-bold ${
                            isTop ? "text-accent-dark" : "text-ink"
                          }`}
                        >
                          {formatRank(entry.rank)}
                        </td>
                        <td className="px-4 py-4 font-medium text-ink">
                          <div className="flex items-center gap-3">
                            <ParticipantAvatar
                              name={entry.displayName}
                              avatarUrl={entry.avatarUrl}
                            />
                            <span className="truncate">{entry.displayName}</span>
                          </div>
                        </td>
                        {!isSkb && (
                          <td className="px-4 py-4 text-right font-mono tabular-nums text-ink">
                            {entry.scoreTwk}
                          </td>
                        )}
                        {!isSkb && (
                          <td className="px-4 py-4 text-right font-mono tabular-nums text-ink">
                            {entry.scoreTiu}
                          </td>
                        )}
                        {!isSkb && (
                          <td className="px-4 py-4 text-right font-mono tabular-nums text-ink">
                            {entry.scoreTkp}
                          </td>
                        )}
                        {isSkb && (
                          <td className="px-4 py-4 text-right font-mono tabular-nums text-ink">
                            {entry.scoreSkb}
                          </td>
                        )}
                        <td
                          className={`px-4 py-4 text-right font-mono text-base font-bold tabular-nums ${
                            isTop ? "text-accent-dark" : "text-ink"
                          }`}
                        >
                          {entry.totalScore}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-xs font-semibold ${
                            entry.isPassed ? "text-accent-dark" : "text-danger-text"
                          }`}
                        >
                          {entry.isPassed ? "Lulus PG" : "Tidak Lulus PG"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedPackage && (
              <div className="flex flex-col items-start justify-between gap-4 border-t border-border-subtle bg-pill px-6 py-4 sm:flex-row sm:items-center">
                <p className="text-xs text-ink-secondary">
                  Seluruh skor pada Papan Peringkat diverifikasi ulang di server saat submit.
                </p>
                <Link
                  href={`/packages/${selectedPackage.slug}`}
                  className={buttonClasses("primary", "rounded", "shrink-0")}
                >
                  Mulai Paket Ini →
                </Link>
              </div>
            )}
          </TactileCard>
        </>
      )}
    </section>
  );
}
