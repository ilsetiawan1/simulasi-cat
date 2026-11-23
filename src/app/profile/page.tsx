import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/ui";
import { ProfileView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Profil Akun",
  description:
    "Atur foto profil, avatar bawaan, dan nama tampilan Papan Peringkat pada akun simcat.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <div className="flex-1">
        <ProfileView />
      </div>
      <Footer />
    </div>
  );
}
