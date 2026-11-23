# simcat — Simulasi CAT CPNS Standar BKN

Aplikasi web simulasi ujian **Seleksi Kompetensi Dasar (SKD)** dan **Seleksi Kompetensi Bidang (SKB)** CPNS berbasis *Computer Assisted Test* (CAT) yang mengikuti standar penilaian BKN dan KepmenPANRB No. 321 Tahun 2024.

Dirancang agar ringan, responsif di desktop maupun ponsel, 100% gratis, dan bisa langsung dikerjakan sebagai **Guest** tanpa wajib mendaftar terlebih dahulu.

## Fitur Utama

- **Langsung Latihan (Zero-Friction Guest Mode):** Mulai simulasi kapan saja tanpa wajib login. Jika ingin menyimpan skor ke Papan Peringkat setelah selesai, cukup masuk dengan Google atau Email — skor akan otomatis tersimpan.
- **Beragam Mode Ujian:**
  - **Simulasi SKD Penuh:** 110 soal, 100 menit (urutan blok TWK → TIU → TKP).
  - **Latihan Cepat (Mini Tryout):** Fokus per subtes (TWK, TIU, atau TKP).
  - **Simulasi SKB:** Penilaian berbasis bidang jabatan (Benar `+5`, Salah/Kosong `0`).
- **Pengacakan Soal & Opsi Anti-Hafal:** Urutan soal diacak per blok subtes dan opsi jawaban A–E diacak secara dinamis pada setiap sesi (tetap menjaga urutan statis untuk soal tertentu seperti *"Semua jawaban di atas benar"*).
- **Ruang Ujian CAT Realistis & Anti-Refresh:** Timer hitung mundur real-time dengan auto-submit, navigasi matriks soal (terjawab, ragu-ragu, kosong), pintasan keyboard di desktop, serta penyimpanan progres otomatis di browser.
- **Evaluasi Passing Grade & Pembahasan Lengkap:** Evaluasi ambang batas resmi (`TWK >= 65`, `TIU >= 80`, `TKP >= 166`) dilengkapi filter pembahasan dan perbandingan jawaban.
- **Papan Peringkat, Riwayat & Profil Akun:** Peringkat per paket dengan aturan *tie-breaker* BKN (`Total → TKP → TIU → TWK → Waktu Tercepat`), riwayat tryout pribadi, serta halaman profil untuk mengatur nama tampilan, foto Google, upload foto, atau memilih avatar bawaan.

## Teknologi yang Digunakan

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database, Auth & Storage:** Supabase (PostgreSQL, Row Level Security, Google OAuth & Email Auth, Storage)
- **Validasi:** Zod
- **Runtime & Package Manager:** Bun
- **Deployment:** Vercel

## Menjalankan Secara Lokal

### Prasyarat
- [Bun](https://bun.sh/) v1.1 atau lebih baru
- Project [Supabase](https://supabase.com/) (Free Tier sudah cukup)

### 1. Clone & Instalasi Dependency

```bash
git clone https://github.com/ilsetiawan1/simulasi-cat.git
cd simulasi-cat
bun install
```

### 2. Konfigurasi Environment

Salin `.env.example` menjadi `.env.local` lalu isi dengan kredensial project Supabase kamu:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Inisialisasi Database & Storage

Jalankan file migrasi dan seed berikut di Supabase SQL Editor (atau menggunakan `supabase/run-sql.ts` dengan `DATABASE_URL` di `.env.local`):

1. `supabase/migrations/001_init_schema.sql` — Tabel inti, indeks tie-breaker, trigger profil, dan RLS policies.
2. `supabase/migrations/002_avatars_storage.sql` — Bucket Storage `avatars` dan RLS policy per pengguna.
3. `supabase/seed.sql` — Paket ujian awal dan contoh soal.

### 4. Jalankan Server Pengembangan

```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Perintah Penting

```bash
bun run dev        # Menjalankan development server
bun run typecheck  # Pemeriksaan tipe TypeScript
bun test src       # Menjalankan unit & integration test
bun run build      # Membangun aplikasi untuk produksi
```

## Dokumentasi

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Specifications Document (TSD)](docs/TSD.md)
- [Design System](docs/DESIGN.md)
