import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Navbar, SelectionHighlight, TactileCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi simcat (simulasicat.my.id) terkait pengelolaan data akun, Google OAuth, riwayat tryout, dan penyimpanan lokal browser.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Kebijakan Privasi | simcat",
    description:
      "Informasi transparan mengenai data yang dikumpulkan dan cara penggunaannya di simcat.",
    url: "/privacy",
  },
};

const SECTIONS = [
  {
    title: "1. Mode Tamu (Tanpa Akun)",
    body: "Anda dapat mengerjakan seluruh simulasi CAT di simcat tanpa login. Pada mode tamu, progres jawaban dan sisa waktu hanya disimpan di penyimpanan lokal browser (localStorage/sessionStorage) pada perangkat Anda dan tidak dikirim ke server kami.",
  },
  {
    title: "2. Data yang Dikumpulkan Saat Login",
    body: "Jika Anda memilih membuat akun menggunakan Email atau masuk dengan Google (Google OAuth), kami hanya menyimpan data dasar yang diperlukan untuk menjalankan layanan: alamat email, nama tampilan, foto profil (avatar), serta riwayat skor tryout yang Anda kirimkan.",
  },
  {
    title: "3. Penggunaan Data",
    body: "Data akun digunakan untuk menyimpan riwayat perkembangan latihan Anda, menampilkan nama tampilan dan avatar pada Papan Peringkat (Leaderboard), serta menyinkronkan sesi autentikasi. Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk keperluan iklan.",
  },
  {
    title: "4. Layanan Pihak Ketiga & Keamanan",
    body: "Autentikasi dan penyimpanan basis data dikelola menggunakan infrastruktur Supabase dengan kebijakan keamanan Row Level Security (RLS), serta hosting aplikasi pada Vercel. Koneksi dilindungi enkripsi HTTPS.",
  },
  {
    title: "5. Kontrol & Hak Pengguna",
    body: "Anda dapat memperbarui nama tampilan dan foto profil kapan saja melalui halaman Profil. Untuk permintaan penghapusan akun atau pertanyaan terkait privasi data, silakan hubungi pengelola melalui email yang tercantum di bawah.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-8 lg:pt-12">
          <p className="font-mono text-xs font-bold tracking-wider text-accent">
            LEGAL &bull; SIMCAT
          </p>
          <h1 className="mt-2 font-mono text-2xl leading-snug tracking-[-0.02em] text-ink sm:text-3xl lg:text-4xl">
            Kebijakan <SelectionHighlight showHandles={false}>Privasi</SelectionHighlight>
          </h1>
          <p className="mt-3 text-sm text-ink-secondary">
            Terakhir diperbarui: November 2026 &bull; Berlaku untuk seluruh layanan{" "}
            <strong className="font-semibold text-ink">simcat</strong> (simulasicat.my.id).
          </p>

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
              <h2 className="text-base font-semibold text-ink">Kontak Pengelola</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, hubungi kami di{" "}
                <a
                  href="mailto:ammstwnn@gmail.com"
                  className="font-medium text-accent-dark underline underline-offset-4 hover:text-ink"
                >
                  ammstwnn@gmail.com
                </a>
                . Lihat juga{" "}
                <Link
                  href="/terms"
                  className="font-medium text-accent-dark underline underline-offset-4 hover:text-ink"
                >
                  Syarat &amp; Ketentuan
                </Link>
                .
              </p>
            </div>
          </TactileCard>
        </section>
      </main>
      <Footer />
    </div>
  );
}
