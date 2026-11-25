import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Navbar, PageReveal } from "@/components/ui";
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
            <PackageConfirmView pkg={pkg} />
          </div>
        </PageReveal>
      </div>
      <Footer />
    </div>
  );
}
