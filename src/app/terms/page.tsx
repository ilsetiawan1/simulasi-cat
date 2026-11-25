import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Navbar, PageReveal, SelectionHighlight, TactileCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan platform latihan simulasi CAT gratis simcat (simulasicat.my.id).",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Syarat & Ketentuan | simcat",
    description:
      "Aturan penggunaan, sifat layanan independen, dan batasan tanggung jawab platform simcat.",
    url: "/terms",
  },
};

const SECTIONS = [
  {
    title: "1. Sifat Layanan & Independensi",
    body: "simcat (simulasicat.my.id) adalah platform simulasi latihan ujian CAT gratis dan independen untuk membantu persiapan seleksi CPNS, Sekolah Kedinasan, dan ujian sejenis. Layanan ini tidak berafiliasi, tidak disponsori, dan bukan merupakan situs resmi Badan Kepegawaian Negara (BKN) maupun Kementerian PANRB.",
  },
  {
    title: "2. Penggunaan yang Diperbolehkan",
    body: "Anda bebas menggunakan seluruh paket simulasi dan pembahasan untuk keperluan belajar pribadi. Anda dilarang melakukan spam, eksploitasi sistem, manipulasi skor Papan Peringkat, scraping otomatis secara berlebihan, atau mengunggah konten yang melanggar hukum pada profil akun.",
  },
  {
    title: "3. Akun Pengguna",
    body: "Pendaftaran akun bersifat opsional. Anda bertanggung jawab menjaga keamanan kredensial akun Anda serta memastikan nama tampilan dan foto profil yang digunakan tetap sopan dan tidak menyesatkan.",
  },
  {
    title: "4. Materi Soal & Akurasi",
    body: "Seluruh soal latihan, kunci jawaban, dan pembahasan disusun semata-mata sebagai bahan latihan. Meski kami berupaya menjaga kesesuaian dengan kisi-kisi serta ambang batas terbaru, kami tidak menjamin kesamaan soal dengan ujian resmi.",
  },
  {
    title: "5. Perubahan Layanan & Ketentuan",
    body: "Kami dapat memperbarui fitur, paket soal, maupun Syarat & Ketentuan ini sewaktu-waktu demi peningkatan kualitas layanan. Penggunaan berkelanjutan setelah pembaruan berarti Anda menyetujui ketentuan terbaru.",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageReveal className="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-8 lg:pt-12">
          <div data-reveal>
            <p className="font-mono text-xs font-bold tracking-wider text-accent">
              LEGAL &bull; SIMCAT
            </p>
            <h1 className="mt-2 font-mono text-2xl leading-snug tracking-[-0.02em] text-ink sm:text-3xl lg:text-4xl">
              Syarat &amp; <SelectionHighlight>Ketentuan</SelectionHighlight>
            </h1>
            <p className="mt-3 text-sm text-ink-secondary">
              Terakhir diperbarui: November 2026 &bull; Dengan mengakses{" "}
              <strong className="font-semibold text-ink">simcat</strong> (simulasicat.my.id),
              Anda menyetujui ketentuan berikut.
            </p>
          </div>

          <div data-reveal>
            <TactileCard className="mt-8 divide-y divide-border-subtle">
            {SECTIONS.map((section) => (
              <div key={section.title} className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {section.body}
                </p>
              </div>
            ))}

            <div className="bg-pill p-6 sm:p-8">
              <h2 className="text-base font-semibold text-ink">Informasi Terkait</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Untuk mengetahui bagaimana data Anda dikelola, baca{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-accent-dark underline underline-offset-4 hover:text-ink"
                >
                  Kebijakan Privasi
                </Link>
                . Pertanyaan dapat dikirimkan ke{" "}
                <a
                  href="mailto:ammstwnn@gmail.com"
                  className="font-medium text-accent-dark underline underline-offset-4 hover:text-ink"
                >
                  ammstwnn@gmail.com
                </a>
                .
              </p>
            </div>
          </TactileCard>
          </div>
        </PageReveal>
      </main>
      <Footer />
    </div>
  );
}
