import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { getGoogleSiteVerification, getSiteUrl } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();
const googleVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "simcat",
  title: {
    default: "simcat — Simulasi CAT CPNS Standar BKN Gratis",
    template: "%s | simcat",
  },
  description:
    "Simulasi ujian CAT CPNS (SKD & SKB) gratis standar BKN tanpa wajib login. Pengacakan soal & opsi A-E, passing grade KepmenPANRB No. 321 Tahun 2024, pembahasan lengkap, dan papan peringkat.",
  keywords: [
    "Simulasi CAT CPNS",
    "Tryout CPNS Gratis",
    "Simulasi SKD BKN",
    "Passing Grade CPNS 2024",
    "KepmenPANRB 321 Tahun 2024",
    "Latihan TWK TIU TKP",
    "Simulasi SKB CPNS",
    "simcat",
  ],
  authors: [{ name: "simcat" }],
  creator: "simcat",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "simcat",
    title: "simcat — Simulasi CAT CPNS Standar BKN Gratis",
    description:
      "Latihan simulasi CAT CPNS (SKD Penuh, Mini Tryout TWK/TIU/TKP, dan SKB) gratis tanpa wajib daftar. Evaluasi passing grade BKN dan pembahasan instan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "simcat — Simulasi CAT CPNS Standar BKN Gratis",
    description:
      "Simulasi CAT CPNS gratis tanpa wajib login: SKD 110 soal, pengacakan soal & opsi, passing grade BKN, dan pembahasan lengkap.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-accent-highlight selection:text-ink">
        {children}
      </body>
    </html>
  );
}
