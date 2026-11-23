import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Masuk | simcat",
  description:
    "Masuk ke simcat untuk menyimpan skor simulasi CAT CPNS ke Papan Peringkat dan Riwayat.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink-secondary">
          Memuat halaman masuk...
        </div>
      }
    >
      <AuthForm mode="login" />
    </Suspense>
  );
}
