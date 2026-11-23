import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/ui";
import { LeaderboardView } from "@/features/leaderboard";

export const metadata: Metadata = {
  title: "Papan Peringkat Tryout CAT CPNS",
  description:
    "Lihat papan peringkat peserta simulasi CAT CPNS (SKD & SKB) per paket ujian dengan aturan tie-breaker resmi BKN.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Papan Peringkat Tryout CAT CPNS | simcat",
    description:
      "Peringkat peserta tryout SKD & SKB CPNS berdasarkan total skor dan aturan tie-breaker BKN.",
    url: "/leaderboard",
  },
};

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LeaderboardView />
      </main>
      <Footer />
    </div>
  );
}
