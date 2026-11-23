import type { Metadata } from "next";
import { CatExamRoom } from "@/features/cat-exam";

export const metadata: Metadata = {
  title: "Ruang Ujian CAT | simcat",
  description: "Simulasi pengerjaan ujian CAT CPNS dengan timer mundur dan auto-save.",
};

interface ExamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { slug } = await params;
  return <CatExamRoom slug={slug} />;
}
