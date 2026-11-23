import { Footer, Navbar } from "@/components/ui";
import { getSiteUrl } from "@/config/site";
import { CatalogSection, HeroSection, HowItWorksSection } from "@/features/exam-catalog";

export default function HomePage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "simcat — Simulasi CAT CPNS Standar BKN",
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "id-ID",
    description:
      "Aplikasi simulasi ujian CAT CPNS (SKD & SKB) gratis standar BKN tanpa wajib login dengan pengacakan soal, evaluasi passing grade KepmenPANRB No. 321 Tahun 2024, pembahasan lengkap, dan papan peringkat.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CatalogSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
}
