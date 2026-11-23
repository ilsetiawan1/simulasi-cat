import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/ui";
import { HistoryView } from "@/features/exam-result";

export const metadata: Metadata = {
  title: "Riwayat Tryout | simcat",
  description:
    "Riwayat skor dan status kelulusan simulasi CAT CPNS yang tersimpan pada akunmu.",
};

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <div className="flex-1">
        <HistoryView />
      </div>
      <Footer />
    </div>
  );
}
