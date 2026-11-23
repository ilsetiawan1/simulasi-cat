import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/ui";
import { ExamResultView } from "@/features/exam-result";

export const metadata: Metadata = {
  title: "Hasil Ujian CAT & Pembahasan",
  description:
    "Ringkasan skor total, status passing grade, dan pembahasan lengkap simulasi CAT CPNS.",
  robots: { index: false, follow: false },
};

interface ResultPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <div className="flex-1">
        <ExamResultView slug={slug} />
      </div>
      <Footer />
    </div>
  );
}
