import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, Footer, Navbar, buttonClasses } from "@/components/ui";
import { CatExamRoom } from "@/features/cat-exam";
import { getActivePackageBySlug } from "@/modules/packages/packages.service";

export const metadata: Metadata = {
  title: "Ruang Ujian CAT",
  description: "Simulasi pengerjaan ujian CAT CPNS dengan timer mundur dan auto-save.",
  robots: { index: false, follow: false },
};

interface ExamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { slug } = await params;

  try {
    const pkg = await getActivePackageBySlug(slug);
    if (pkg.category === "SKB") {
      return (
        <div className="flex min-h-screen flex-col bg-paper text-ink">
          <Navbar />
          <main className="mx-auto flex w-full max-w-[720px] flex-1 items-center px-4 py-12 sm:px-6">
            <div className="w-full">
              <EmptyState
                title="Simulasi SKB — Segera Hadir"
                description="Akses ujian Seleksi Kompetensi Bidang (SKB) belum dibuka. Silakan coba Tryout SKD Penuh atau Latihan Subtes terlebih dahulu."
                action={
                  <Link href="/#katalog" className={buttonClasses("primary", "rounded")}>
                    Kembali ke Katalog SKD →
                  </Link>
                }
              />
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  } catch {
    // Biarkan CatExamRoom menangani pesan paket tidak ditemukan secara konsisten
  }

  return <CatExamRoom slug={slug} />;
}
