# Simulasi CAT CPNS (`simulasi-cat`)

Aplikasi web simulasi ujian Seleksi Kompetensi Dasar (SKD) dan Seleksi Kompetensi Bidang (SKB) CPNS berbasis Computer Assisted Test (CAT) standar BKN. Dibangun agar ringan, 100% gratis (Free-Tier), dan dapat langsung dikerjakan sebagai Guest tanpa wajib login.

## Fitur Utama

* **Mode Ujian Lengkap:** Simulasi SKD Penuh (110 soal, 100 menit), Latihan Cepat per Subtes (TWK, TIU, TKP), dan Simulasi SKB (+5 benar, 0 salah/kosong).
* **Anti-Memorization:** Pengacakan soal berbasis Fisher-Yates di dalam masing-masing blok subtes (`TWK 1-30 -> TIU 31-65 -> TKP 66-110`) serta pengacakan posisi opsi A-E dinamis (kecuali flag `shuffle_options = false`).
* **Ruang Ujian CAT & Anti-Refresh:** Timer mundur real-time dengan auto-submit, matriks navigasi soal (terjawab, ragu-ragu, kosong), serta persistensi state di `localStorage`.
* **Passing Grade BKN (KepmenPANRB No. 321 Tahun 2024):** Evaluasi otomatis ambang batas `TWK >= 65`, `TIU >= 80`, dan `TKP >= 166` (Total maks `550`, minimal `311`).
* **Pembahasan, Leaderboard & Guest-to-Auth Handoff:** Pembahasan lengkap tiap soal, papan peringkat dengan aturan tie-breaker (`Total -> TKP -> TIU -> TWK -> Waktu Submit Tercepat`), serta penyimpanan otomatis skor Guest setelah login (dengan kalkulasi ulang skor di server).

## Tech Stack

* **Runtime & Package Manager:** Bun
* **Frontend:** Next.js (App Router), React, TypeScript (`strict`), Tailwind CSS
* **Backend & Database:** Next.js Route Handlers, Supabase (PostgreSQL `ap-southeast-1`, Auth Google OAuth & Email, Row Level Security), Zod
* **Testing:** `bun test` (Unit & API Integration Testing), Playwright (End-to-End Testing)
* **Deployment:** Vercel

## Arsitektur

* **Frontend (Feature-Driven Architecture):** Modul dikelompokkan per domain di `src/features/` (`exam-catalog`, `cat-exam`, `exam-result`, `leaderboard`, `auth`) dengan komponen atomik bersama di `src/components/ui/`.
* **Backend (Modular Layered Repository Pattern):** Alur eksekusi ketat `Route Handler -> Controller (Zod) -> Service (Business Logic & Auth) -> Repository (Supabase Query) -> PostgreSQL (RLS)` pada modul `src/modules/` (`packages`, `questions`, `scores`, `profiles`).
* **Standar Kode:** Zero RegEx Policy (validasi via `zod` & native string methods), pragmatic engineering (`ponytail`), dan verifikasi skor di server (`security-audit`).

## Struktur Repositori

```text
simulasi-cat/
├── docs/
│   ├── PRD.md                    # Product Requirements Document
│   ├── TSD.md                    # Technical Specifications Document (DDL, RLS, API, Algoritma)
│   ├── DESIGN.md                 # Design System (Warm Paper Editorial)
│   ├── ROADMAP.md                # Fase pengerjaan (Fase 1 - Fase 7)
│   └── simulasi-cat.figcraft     # Desain UI/UX (Mobile, Tablet, Desktop)
├── AGENTS.md                     # Standar pengembangan & guardrail AI Agent
└── README.md
```

## Perintah Pengembangan (Tahap Implementasi)

```bash
bun install           # Instalasi dependency
bun run dev           # Menjalankan development server
bun run build         # Production build
bun test              # Menjalankan unit test & API integration test
bun run test:e2e      # Menjalankan End-to-End test (Playwright)
```

Salin `.env.example` menjadi `.env.local` dan isi kredensial Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Alur Git

Mulai dari Fase 2 dan seterusnya, setiap perubahan wajib menggunakan branch terisolasi dari `main` (`feat/<fitur>`, `fix/<bug>`, `refactor/<modul>`, `test/<scope>`, `docs/<dokumen>`) dengan format Conventional Commits.

## Dokumen Rujukan

* [PRD](docs/PRD.md)
* [TSD](docs/TSD.md)
* [Design System](docs/DESIGN.md)
* [Roadmap](docs/ROADMAP.md)
* [Agent Standards](AGENTS.md)
