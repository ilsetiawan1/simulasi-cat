import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Navbar } from "@/components/ui";
import { PackageConfirmView } from "@/features/exam-catalog";
import { getActivePackageBySlug } from "@/modules/packages/packages.service";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pkg = await getActivePackageBySlug(slug);
    return {
      title: `${pkg.title} — Konfirmasi Ujian | simcat`,
      description: pkg.description,
    };
  } catch {
    return {
      title: "Paket Tidak Ditemukan | simcat",
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
        <PackageConfirmView pkg={pkg} />
      </div>
      <Footer />
    </div>
  );
}
