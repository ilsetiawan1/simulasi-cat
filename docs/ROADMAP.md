# Simulasi CAT CPNS (`simulasi-cat`) - Roadmap & Fase Pengerjaan

Dokumen ini menjadi panduan eksekusi bertahap dari desain hingga rilis produksi untuk **Simulasi CAT CPNS (`simulasi-cat`)**, mengacu pada `docs/PRD.md`, `docs/TSD.md`, `docs/DESIGN.md`, dan `AGENTS.md`.

---

## Ringkasan Progres Fase

| Fase | Nama Fase | Target Branch Git | Status |
| :---: | :--- | :--- | :---: |
| **1** | Fondasi Dokumen & Desain UI/UX (FigCraft) | `docs/init-prd-tsd-design` | **Selesai** |
| **2** | Setup Arsitektur Folder & Dependency Teknologi | `feat/project-setup` | **Selesai** |
| **3** | Instalasi & Integrasi Database (Supabase) | `feat/supabase-schema-seed` | **Selesai** |
| **4** | Backend (Core Engine & Repository Pattern) | `feat/backend-modules` | Belum Dimulai |
| **5** | Frontend (Feature-Driven Architecture) | `feat/frontend-ui` *(dapat dipecah per fitur)* | Belum Dimulai |
| **6** | Final Testing & Security QA | `test/qa-and-security` | Belum Dimulai |
| **7** | Deployment (Vercel & Supabase Production) | `chore/production-deploy` | Belum Dimulai |

---

## Fase 1 — Fondasi Dokumen & Desain UI/UX (SELESAI)

**Output yang telah selesai:**
- [x] `docs/PRD.md` — Spesifikasi produk, FR-01 s.d. FR-06, standar passing grade KepmenPANRB No. 321/2024, tie-breaker, dan NFR.
- [x] `docs/TSD.md` — Arsitektur FDA & Modular Layered Repository Pattern, DDL SQL + RLS, kontrak API, dan spesifikasi algoritma inti.
- [x] `docs/DESIGN.md` — Sistem desain **Warm Paper Editorial** (`#F4F3EE`, `#FAF9F5`, `#181816`, `#43A018`, `#CBE8B4`, `JetBrains Mono` + `Inter`).
- [x] `AGENTS.md` & `README.md` — Disinkronkan penuh dengan metadata proyek, modul FDA, modul backend, dan entitas database.
- [x] `docs/simulasi-cat.figcraft` — Halaman `V2 - Warm Paper Editorial` berisi 24 frame lengkap (8 halaman × Mobile `390px`, Tablet `768px`, Desktop `1440px`): `Login`, `Register`, `Home`, `Ruang Ujian CAT`, `Hasil Ujian CAT`, `Papan Peringkat`, `Aturan BKN`, dan `Error Page (404)`.

**Checklist penutup sebelum masuk Fase 2:**
- [ ] Commit seluruh dokumen Fase 1 pada branch `docs/init-prd-tsd-design` dan merge ke `main` (tanpa commit langsung ke `main`).

---

## Fase 2 — Setup Arsitektur Folder & Dependency Teknologi

**Target Branch:** `feat/project-setup`

**Deliverables:**
- [x] Inisialisasi proyek **Next.js (App Router)** + **TypeScript (`strict: true`)** + **Tailwind CSS** menggunakan **Bun**.
- [x] Instalasi dependency inti: `zod`, `@supabase/supabase-js`, `@supabase/ssr`, dan `@playwright/test` (unit & API integration test menggunakan **`bun test`** bawaan Bun).
- [x] Pembuatan struktur folder sesuai `docs/TSD.md`:
  * Frontend FDA: `src/features/{exam-catalog,cat-exam,exam-result,leaderboard,auth}/` dan `src/components/ui/`
  * Backend Modular: `src/modules/{packages,questions,scores,profiles}/`
  * Shared & Config: `src/config/`, `src/constants/`, `src/middlewares/`, `src/utils/`, `src/lib/{supabase,exam-engine,storage}/`
- [x] Setup font (`Plus Jakarta Sans`, `JetBrains Mono`, `Inter`) via `next/font/google` dan design tokens warna/radius/shadow di `globals.css` sesuai `docs/DESIGN.md`.
- [x] Setup file `.env.example` dan validasi environment variable dengan Zod (`src/config/env.ts`).

**Kriteria Selesai:** `bun run dev`, `bun run build`, dan `bun test` berjalan tanpa error.

---

## Fase 3 — Instalasi & Integrasi Database (Supabase)

**Target Branch:** `feat/supabase-schema-seed`

**Deliverables:**
- [x] Setup proyek Supabase di region **`ap-southeast-1` (Singapore)** dan hubungkan `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` ke `.env.local`.
- [x] Buat file migrasi SQL `supabase/migrations/001_init_schema.sql`:
  * Tabel `profiles`, `exam_packages`, `questions` (dengan `options JSONB` tanpa huruf A-E statis & `shuffle_options`), dan `scores` (dengan `unique (user_id, client_attempt_id)`).
  * Indeks kinerja: `idx_questions_package_subtest`, `idx_scores_leaderboard_rank` (tie-breaker BKN), dan `idx_scores_user_history`.
  * Trigger `handle_new_user()` untuk membuat profil otomatis saat user registrasi.
  * Seluruh kebijakan **Row Level Security (RLS)** untuk `anon` dan `authenticated`.
- [x] Buat file `supabase/seed.sql` berisi paket aktif (SKD Penuh, Mini Tryout TWK/TIU/TKP, SKB) beserta sampel soal realistis (termasuk minimal 1 soal dengan `shuffle_options = false`).
- [x] Implementasi `src/lib/supabase/client.ts` (browser) & `src/lib/supabase/server.ts` (cookie-aware server client) serta route handler `src/app/auth/callback/route.ts`.
- [ ] Konfigurasi provider **Email** dan **Google OAuth** di Supabase Auth Dashboard.

**Kriteria Selesai:** Semua tabel, indeks, trigger, RLS, dan data seed aktif di Supabase serta koneksi baca dari Next.js terverifikasi.

---

## Fase 4 — Backend (Core Engine & Modular Layered Repository Pattern)

**Target Branch:** `feat/backend-modules`

**Deliverables:**
- [ ] **Konstanta & Pure Exam Engine (dipakai bersama Server & Client Guest):**
  * `src/constants/passing-grade.ts` (KepmenPANRB No. 321 Tahun 2024: TWK 65, TIU 80, TKP 166, Total 311).
  * `src/lib/exam-engine/shuffle.ts` — Fisher-Yates Shuffle per blok subtes (`TWK -> TIU -> TKP`) & pengacakan opsi A-E dengan pengecualian `shuffle_options = false`.
  * `src/lib/exam-engine/scoring.ts` — Kalkulasi skor SKD Penuh, Mini Tryout, dan SKB (+5 / 0) + status passing grade.
  * `src/lib/storage/exam-storage.ts` — Safe `localStorage` persistence dengan validasi Zod.
- [ ] **Shared Backend Infrastructure:**
  * `src/middlewares/auth-guard.ts` (`supabase.auth.getUser()`), `src/middlewares/error-handler.ts` (tanpa bocor stack trace/error SQL), `src/utils/http-response.ts`.
- [ ] **4 Modul Domain (`controller -> service -> repository` + colocated `*.openapi.ts` & `__tests__/`):**
  * `src/modules/packages/` -> `GET /api/packages`
  * `src/modules/questions/` -> `GET /api/packages/[slug]/questions` (1x request seluruh soal paket)
  * `src/modules/scores/` -> `POST /api/scores` (hitung ulang skor di server dari `answers` + idempotency `client_attempt_id`), `GET /api/scores/me`, `GET /api/leaderboard` (terurut sesuai tie-breaker BKN)
  * `src/modules/profiles/` -> `PATCH /api/profile`
- [ ] **Thin Route Handlers** di `src/app/api/*` yang hanya mendelegasikan ke Controller modul terkait.

**Kriteria Selesai:** Seluruh endpoint berfungsi, strict layering terjaga, nol penggunaan RegEx, dan unit test untuk `shuffle.ts`, `scoring.ts`, dan `scores.service.ts` lulus 100%.

---

## Fase 5 — Frontend (Feature-Driven Architecture)

**Target Branch:** `feat/frontend-ui` *(disarankan dipecah menjadi 3 sub-branch agar review tetap fokus)*

### 5A. Komponen UI Dasar & Halaman Publik (`feat/ui-public-pages`)
- [ ] Komponen bersama di `src/components/ui/` (`Button`, `TactileCard`, `Modal`, `Drawer`, `EmptyState`).
- [ ] **`Home`** (`src/app/page.tsx`) — Single page sesuai FigCraft V2: Navbar (`simcat`, `Home | Papan Peringkat | Aturan BKN`, `Masuk`), Hero + selection highlight hijau + 3 kartu miring + aset line-art SVG, Section Katalog, Section Cara Kerja (4 langkah), dan Footer.
- [ ] **`Papan Peringkat`** (`src/app/leaderboard/page.tsx`) — Pemilih paket, tabel peringkat Desktop/Tablet, kartu peringkat Mobile, serta empty/loading/error state.
- [ ] **`Aturan BKN`** (`src/app/aturan-bkn/page.tsx`) — Tabel KepmenPANRB 321/2024, kartu tie-breaker, pengacakan & SKB, dan CTA mulai simulasi.
- [ ] **`Error Page (404)`** (`src/app/not-found.tsx`) — Halaman 404 sesuai FigCraft V2.

### 5B. Alur Ujian CAT & Evaluasi (`feat/cat-exam-ui`)
- [ ] **Konfirmasi Ujian** (`src/app/packages/[slug]/page.tsx`) — Ringkasan aturan paket, passing grade, tombol Mulai Ujian / Lanjutkan Sesi.
- [ ] **Ruang Ujian CAT** (`src/app/exam/[slug]/page.tsx`) — 1x fetch soal, Fisher-Yates shuffle, snapshot `localStorage` anti-refresh, timer mundur berbasis `endTimestamp` + auto-submit, panel matriks kanan (Desktop), drawer `Daftar Soal` (Mobile & Tablet), modal konfirmasi selesai ujian, dan navigasi keyboard.
- [ ] **Hasil Ujian CAT** (`src/app/result/[slug]/page.tsx`) — Ringkasan skor total & subtes, status passing grade, filter & daftar pembahasan lengkap, serta banner CTA Guest-to-Auth Handoff.

### 5C. Autentikasi & Guest-to-Auth Handoff (`feat/auth-and-handoff`)
- [ ] **`Login`** (`src/app/login/page.tsx`) & **`Register`** (`src/app/register/page.tsx`) — Google OAuth (dengan ikon Google 4 warna), Email/Password, dan tautan lanjut sebagai Guest.
- [ ] Hook `useGuestScoreHandoff` — Deteksi pending skor di `localStorage` usai login, submit otomatis ke `POST /api/scores`, notifikasi sukses, dan hapus data lokal agar tidak duplikat.
- [ ] **`Riwayat`** (`src/app/history/page.tsx`) — Riwayat percobaan tryout pribadi untuk pengguna yang sudah login.

**Kriteria Selesai:** Semua layar sesuai FigCraft V2 di breakpoint Mobile (`390px`), Tablet (`768px`), dan Desktop (`1440px`) tanpa horizontal overflow.

---

## Fase 6 — Final Testing & Security QA

**Target Branch:** `test/qa-and-security`

**Deliverables:**
- [ ] **Unit & API Integration Test (`bun test`):**
  * Pengacakan blok TWK (1-30), TIU (31-65), TKP (66-110) tidak pernah tertukar antar subtes.
  * Soal dengan `shuffle_options = false` mempertahankan urutan opsi.
  * Batas tepat passing grade (`TWK=65, TIU=80, TKP=166` lulus; salah satu kurang 1 poin tidak lulus).
  * Pengurutan tie-breaker (`Total -> TKP -> TIU -> TWK -> Waktu Submit Tercepat`).
  * Idempotency `POST /api/scores` dengan `client_attempt_id` sama tidak membuat baris duplikat.
- [ ] **End-to-End Functional QA (Playwright):**
  * Guest Mode: mengerjakan hingga hasil & pembahasan tanpa ada request `INSERT` ke database.
  * Anti-Refresh: reload browser di tengah ujian tidak mereset timer, urutan soal/opsi, maupun jawaban.
  * Auto-Submit: waktu mencapai `00:00:00` otomatis menyelesaikan ujian.
  * Guest-to-Auth Handoff: skor Guest otomatis masuk ke Leaderboard setelah login.
- [ ] **Security & Code Quality Audit (`security-audit` & Zero RegEx):**
  * Verifikasi `POST /api/scores` mengabaikan skor mentah dari client (selalu hitung ulang di server).
  * Verifikasi RLS Supabase menolak `INSERT` anonim atau `INSERT` dengan `user_id` orang lain.
  * Audit Zero RegEx di seluruh `src/` (tidak ada `RegExp` atau `/pattern/`).
  * Verifikasi tidak ada secret hardcoded maupun kebocoran stack trace pada error response.

---

## Fase 7 — Deployment (Vercel & Supabase Production)

**Target Branch:** `chore/production-deploy`

**Deliverables:**
- [ ] Konfigurasi proyek di **Vercel** terhubung ke repository GitHub (`main` branch).
- [ ] Set environment variables produksi di Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] Daftarkan domain produksi Vercel pada **Supabase Auth -> URL Configuration** (Site URL & Redirect URLs untuk `/auth/callback`) dan Google Cloud Console OAuth Redirect URI.
- [ ] Jalankan production build check (`bun run build`) dan smoke test langsung di URL produksi (Home, Aturan BKN, Guest SKD tryout, Login Google/Email, simpan skor ke Leaderboard, dan halaman 404).
