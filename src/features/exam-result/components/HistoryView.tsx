"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, TactileCard, buttonClasses } from "@/components/ui";
import {
  fetchMyScoreHistory,
  type ScoreHistoryItem,
} from "../api/scores.api";

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${secs}d`;
}

function formatDateId(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSubtestSummary(item: ScoreHistoryItem): string {
  const category = item.exam_packages?.category;
  if (category === "SKB") {
    return `SKB ${item.score_skb}`;
  }
  if (category === "MINI_TWK") {
    return `TWK ${item.score_twk}`;
  }
  if (category === "MINI_TIU") {
    return `TIU ${item.score_tiu}`;
  }
  if (category === "MINI_TKP") {
    return `TKP ${item.score_tkp}`;
  }
  return `TWK ${item.score_twk} • TIU ${item.score_tiu} • TKP ${item.score_tkp}`;
}

export function HistoryView() {
  const [items, setItems] = useState<ScoreHistoryItem[]>([]);
  const [status, setStatus] = useState<
    "loading" | "unauthorized" | "error" | "ready"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const outcome = await fetchMyScoreHistory(30);
      if (outcome.status === "unauthorized") {
        setStatus("unauthorized");
        return;
      }
      setItems(outcome.items);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal memuat riwayat tryout.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (status === "loading") {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12">
        <TactileCard className="p-8 text-center">
          <p className="font-mono text-sm font-semibold text-ink-secondary">
            Memuat riwayat tryout kamu...
          </p>
        </TactileCard>
      </main>
    );
  }

  if (status === "unauthorized") {
    return (
      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-8">
        <EmptyState
          title="Masuk untuk melihat riwayat tryout"
          description="Riwayat skor pribadi hanya tersedia untuk pengguna yang sudah masuk dengan Google atau Email."
          action={
            <Link
              href="/login?next=/history"
              className={buttonClasses("primary", "rounded")}
            >
              Masuk Sekarang →
            </Link>
          }
        />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-8">
        <EmptyState
          title="Riwayat tidak dapat dimuat"
          description={errorMessage ?? "Terjadi kendala saat mengambil data dari server."}
          action={
            <Button variant="primary" onClick={loadHistory}>
              Coba Lagi
            </Button>
          }
        />
      </main>
    );
  }

  const passedCount = items.filter((item) => item.is_passed).length;
  const bestScore = items.reduce((max, item) => Math.max(max, item.total_score), 0);

  return (
    <main className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-8 sm:px-8 lg:px-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Riwayat Tryout Saya
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Catatan seluruh percobaan simulasi CAT CPNS yang tersimpan di akunmu.
          </p>
        </div>
        <Link href="/#katalog" className={buttonClasses("primary", "rounded")}>
          Mulai Simulasi Baru →
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat tryout tersimpan"
          description="Selesaikan satu paket simulasi SKD, Mini Tryout, atau SKB untuk mulai melacak perkembangan skormu di sini."
          action={
            <Link href="/#katalog" className={buttonClasses("primary", "rounded")}>
              Pilih Paket Tryout →
            </Link>
          }
        />
      ) : (
        <>
          {/* Ringkasan Statistik */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TactileCard shadow="sm" className="p-4">
              <p className="text-xs font-medium text-ink-muted">Total Percobaan</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink">
                {items.length}
              </p>
            </TactileCard>
            <TactileCard shadow="sm" className="bg-accent-soft p-4">
              <p className="text-xs font-medium text-ink-secondary">Lulus Passing Grade</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-accent-dark">
                {passedCount} / {items.length}
              </p>
            </TactileCard>
            <TactileCard shadow="sm" className="p-4">
              <p className="text-xs font-medium text-ink-muted">Skor Tertinggi</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink">
                {bestScore}
              </p>
            </TactileCard>
          </div>

          {/* Tabel Desktop & Tablet */}
          <TactileCard className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-[1.5px] border-ink bg-pill font-mono text-xs uppercase tracking-wide text-ink-secondary">
                    <th className="px-5 py-3.5">Paket Ujian</th>
                    <th className="px-4 py-3.5">Total</th>
                    <th className="px-4 py-3.5">Rincian Subtes</th>
                    <th className="px-4 py-3.5">Durasi</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-pure">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-card">
                      <td className="px-5 py-4 font-medium text-ink">
                        {item.exam_packages ? (
                          <Link
                            href={`/packages/${item.exam_packages.slug}`}
                            className="hover:underline"
                          >
                            {item.exam_packages.title}
                          </Link>
                        ) : (
                          "Paket Tryout"
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-base font-bold tabular-nums text-ink">
                        {item.total_score}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs tabular-nums text-ink-secondary">
                        {formatSubtestSummary(item)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs tabular-nums text-ink-secondary">
                        {formatDuration(item.duration_seconds)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            item.is_passed ? "text-accent-dark" : "text-danger-text"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.is_passed ? "bg-accent" : "bg-danger-border"
                            }`}
                            aria-hidden="true"
                          />
                          {item.is_passed ? "Lulus" : "Belum Lulus"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs tabular-nums text-ink-muted">
                        {formatDateId(item.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TactileCard>

          {/* Kartu Mobile */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <TactileCard key={item.id} shadow="sm" className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {item.exam_packages?.title ?? "Paket Tryout"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {formatDateId(item.completed_at)}
                    </p>
                  </div>
                  <span className="font-mono text-xl font-bold tabular-nums text-ink">
                    {item.total_score}
                  </span>
                </div>

                <p className="mt-3 font-mono text-xs tabular-nums text-ink-secondary">
                  {formatSubtestSummary(item)}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold ${
                      item.is_passed ? "text-accent-dark" : "text-danger-text"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.is_passed ? "bg-accent" : "bg-danger-border"
                      }`}
                      aria-hidden="true"
                    />
                    {item.is_passed ? "Lulus PG" : "Belum Lulus"}
                  </span>
                  <span className="font-mono tabular-nums text-ink-muted">
                    {formatDuration(item.duration_seconds)}
                  </span>
                </div>
              </TactileCard>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
