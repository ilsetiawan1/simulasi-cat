import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, Footer, Navbar, PageReveal, buttonClasses } from "@/components/ui";
import { PackageConfirmView } from "@/features/exam-catalog";
import { getActivePackageBySlug } from "@/modules/packages/packages.service";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pkg = await getActivePackageBySlug(slug);
    const description = `${pkg.description} (${pkg.total_questions} soal, durasi ${pkg.duration_minutes} menit, gratis tanpa wajib login).`;
    return {
      title: `${pkg.title} — Simulasi CAT CPNS`,
      description,
      alternates: { canonical: `/packages/${pkg.slug}` },
      openGraph: {
        title: `${pkg.title} | simcat`,
        description,
        url: `/packages/${pkg.slug}`,
      },
    };
  } catch {
    return {
      title: "Paket Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }
}

export default async function PackageConfirmPage({ params }: PackagePageProps) {
  const { slug } = await params;

  let pkg;
  try {
    pkg = await getActivePackageBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <div className="flex-1">
        <PageReveal>
          <div data-reveal>
            {pkg.category === "SKB" ? (
              <main className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6">
                <EmptyState
                  title="Simulasi SKB — Segera Hadir"
                  description="Bank soal dan simulasi Seleksi Kompetensi Bidang (SKB) sedang kami siapkan. Untuk saat ini, kamu bisa berlatih Tryout SKD Penuh atau Latihan Subtes TWK, TIU, dan TKP."
                  action={
                    <Link href="/#katalog" className={buttonClasses("primary", "rounded")}>
                      Kembali ke Katalog SKD →
                    </Link>
                  }
                />
              </main>
            ) : (
              <PackageConfirmView pkg={pkg} />
            )}
          </div>
        </PageReveal>
      </div>
      <Footer />
    </div>
  );
}
