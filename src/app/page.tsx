import { Footer, Navbar } from "@/components/ui";
import { CatalogSection, HeroSection, HowItWorksSection } from "@/features/exam-catalog";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
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
