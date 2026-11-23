import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/ui";
import { LeaderboardView } from "@/features/leaderboard";

export const metadata: Metadata = {
  title: "Papan Peringkat — simcat",
  description:
    "Papan peringkat tryout CAT CPNS berdasarkan paket ujian dengan aturan tie-breaker BKN.",
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
