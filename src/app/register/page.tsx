import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Buat Akun | simcat",
  description:
    "Daftar gratis di simcat untuk menyimpan riwayat tryout CPNS dan masuk Papan Peringkat.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink-secondary">
          Memuat halaman pendaftaran...
        </div>
      }
    >
      <AuthForm mode="register" />
    </Suspense>
  );
}
