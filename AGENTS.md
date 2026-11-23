# Simulasi CAT CPNS (`simulasi-cat`) - Standar Terpadu Desain & Pengembangan Proyek

> **Metadata Proyek:**
> - **Nama Aplikasi:** Simulasi CAT CPNS (`simulasi-cat`)
> - **Dokumen Rujukan:** `docs/PRD.md` (Product Requirements Document) & `docs/TSD.md` (Technical Specifications Document)
> - **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL `ap-southeast-1`, Auth, RLS), Zod, Vercel
> - **Pola Arsitektur:** Frontend (Feature-Driven Architecture) | Backend (Modular Layered Repository Pattern di atas Next.js Route Handlers)
> - **Alat Desain:** FigCraft (Canvas Control via Localhost 7979)

---

## 0. Instruksi Inisialisasi & Kepatuhan Dokumen

1. **Dokumen Fondasi Aktif:**
   `AGENTS.md` ini telah disinkronkan dengan `docs/PRD.md` dan `docs/TSD.md`. Setiap kali ada perubahan besar pada fitur, skema database, atau kontrak API, perbarui `docs/PRD.md`, `docs/TSD.md`, dan daftar modul di dokumen ini terlebih dahulu.
2. **Kepatuhan Terhadap PRD & TSD:**
   Seluruh rancangan antarmuka di FigCraft dan kode yang dihasilkan tidak boleh menyimpang dari batasan fungsional pada `docs/PRD.md` (termasuk standar passing grade KepmenPANRB No. 321 Tahun 2024, Zero-Friction Guest Mode, dan 100% Free-Tier) maupun batasan teknis pada `docs/TSD.md`.

---

## 1. Standar Workflow Git & GitHub

Untuk menjaga kode tetap terisolasi, stabil, dan bersih:
* **Larangan Commit Langsung:** Dilarang keras melakukan commit langsung ke branch utama (`main` atau `master`).
* **Isolasi Fitur Baru:** Setiap mulai mengerjakan fitur, modul, atau perbaikan baru, wajib membuat branch terisolasi dari branch `main`:
  * Fitur baru: `feat/<nama-fitur>` (contoh: `feat/cat-exam-engine`, `feat/guest-score-handoff`)
  * Perbaikan bug: `fix/<nama-bug>` (contoh: `fix/tkp-passing-grade-check`)
  * Refaktorisasi: `refactor/<nama-modul>` (contoh: `refactor/scores-repository`)
  * Dokumentasi: `docs/<nama-dokumen>` (contoh: `docs/init-prd-tsd`)
* **Konvensi Pesan Commit (Conventional Commits):**
  Gunakan awalan baku: `feat:`, `fix:`, `refactor:`, `style:`, `test:`, `docs:`.
* **Protokol:** Konfirmasi atau laporkan nama branch yang dibuat kepada pengguna sebelum mulai memodifikasi kode.

---

## 2. Bagian A: Standar Desain UI/UX (FigCraft Workflow)

Aturan ini aktif saat Agent diminta membuat, merancang, atau merevisi visual di kanvas FigCraft.

### A.1. Integrasi Skills Desain
* **`antislop-ui`**: Wajib dipatuhi untuk menjaga desain tetap bernapas (*airy*), minimalis, fokus pada keterbacaan soal CAT, dan bebas dari tampilan klise AI.
* **`antislop-layoutmobile`**: Wajib dipatuhi saat membuat frame layar ponsel (target sentuh $\ge 44 \times 44$ px, reflow 3 tahap mobile/tablet/desktop, matriks soal di drawer, tanpa horizontal overflow).
* **`antislop-copywriting`**: Wajib dipatuhi untuk teks tombol, label, modal konfirmasi, dan empty/error state agar singkat, jelas, natural, dan bebas emoji dekoratif.

### A.2. Aturan Estetika & Anti-AI Slop
* **Bebas Pill/Badge Soup:** Dilarang membungkus setiap teks atau status ke dalam kotak/badge kapsul berwarna-warni pekat. Gunakan indikator minimalis: satu titik warna 6px di samping teks netral.
* **Tipografi & Hirarki Brand:**
  * **Logo/Brand:** Gunakan font display geometris berbeda (*Poppins*, *Plus Jakarta Sans*, atau *Outfit*) dengan *letter-spacing* tegas agar terbedakan dari konten soal.
  * **Konten Soal & Body:** Gunakan font antarmuka netral (*Inter*) dengan kontras teks $\ge 4.5:1$ dan angka tabular (`tabular-nums`) untuk timer CAT (`JJ:MM:DD`) serta tabel skor.
  * **Bebas Teks Fluff:** Hilangkan teks pemasaran kosong, jargon AI, atau kutipan panjang pada antarmuka fungsional.
* **Efek Kaca (*Glassmorphism*):**
  Gunakan hanya sebagai aksen terbatas (maksimal 1-2 elemen bila diperlukan): `backgroundBlur` (radius 20-36px), isian putih transparan (`#FFFFFFB8` - `#FFFFFFEE`), border tipis 1px, dan drop shadow lembut. Kontras teks wajib memenuhi $\ge 4.5:1$.

### A.3. Operasional Kanvas
* **Penamaan Frame Wajib Jelas:** Format: `[Nama Layar] - (Desktop 1440x900)` atau `[Nama Layar] - (Mobile 390x844)`.
* **Daftar Layar Utama (`docs/PRD.md`):**
  * `Landing & Katalog Tryout`
  * `Konfirmasi Ujian`
  * `Ruang Ujian CAT`
  * `Hasil & Pembahasan`
  * `Papan Peringkat`
* **Generasi Bertahap (*Live Generation*):** Buat komponen per blok logis (Background -> Kontainer -> Navigasi -> Konten -> Aksi) agar pengguna dapat memantau prosesnya di layar.
* **Auto-Save:** Panggil `save_file` setelah menyelesaikan revisi kanvas utama.

---

## 3. Bagian B: Standar Pengembangan Kode (Full-Stack Engineering)

Aturan ini aktif saat Agent diminta mengimplementasikan kode aplikasi frontend maupun backend.

### B.1. Frontend: Feature-Driven Architecture (FDA)
Seluruh kode frontend wajib dikelompokkan berdasarkan **domain fitur/bisnis**:
```text
src/
├── features/
│   ├── exam-catalog/    # Katalog paket SKD/Mini Tryout/SKB & halaman konfirmasi aturan ujian
│   ├── cat-exam/        # Ruang ujian CAT, Fisher-Yates shuffle, timer, matriks soal, localStorage persistence
│   ├── exam-result/     # Ringkasan skor, status passing grade, pembahasan, CTA Guest-to-Auth handoff
│   ├── leaderboard/     # Papan peringkat per paket & aturan tie-breaker BKN
│   └── auth/            # Supabase Auth (Google OAuth / Email), sesi login, profil pengguna
│       ├── components/  # Komponen visual khusus fitur ini
│       ├── hooks/       # Custom hooks khusus fitur ini
│       ├── api/         # Request fetch ke endpoint fitur
│       ├── types/       # Interface / tipe TypeScript khusus fitur
│       └── index.ts     # Public API resmi yang boleh diakses fitur lain
├── components/
│   └── ui/              # Komponen atomik bersama (>= 3 fitur): Button, Modal, Drawer, Card, EmptyState
└── lib/
    ├── exam-engine/     # Pure logic bersama: Fisher-Yates shuffle & kalkulasi skor SKD/SKB
    ├── storage/         # Safe localStorage persistence dengan validasi Zod
    └── supabase/        # Browser & server Supabase clients
```
* Komponen atomik yang dipakai di $\ge 3$ fitur diletakkan di `src/components/ui/`.
* Dilarang melakukan ketergantungan melingkar (*circular dependency*) antar folder fitur.

### B.2. Backend: Modular Layered Architecture dengan Repository Pattern
Seluruh kode backend dikelompokkan berdasarkan **modul domain** di dalam folder `src/modules/<nama-modul>/`, dengan Next.js Route Handlers di `src/app/api/*` sebagai adapter HTTP tipis:

```text
src/
├── config/                  # Validasi env vars (Zod)
├── constants/               # Passing grade KepmenPANRB 321/2024 & urutan blok subtes
├── middlewares/             # Auth guard (supabase.auth.getUser), safe JSON error handler
├── utils/                   # Helper HTTP response bersama lintas modul
└── modules/
    ├── packages/            # Katalog paket ujian aktif
    ├── questions/           # Pengambilan 1x request seluruh soal dalam 1 paket
    ├── scores/              # Kalkulasi ulang skor di server, simpan skor (RLS), riwayat & leaderboard
    └── profiles/            # Profil pengguna (display_name, avatar_url)
        ├── __tests__/       # Unit & integration test khusus modul ini
        ├── <modul>.controller.ts  # Validasi payload Zod & format HTTP response
        ├── <modul>.service.ts     # Logika bisnis, otorisasi, kalkulasi skor & tie-breaker
        ├── <modul>.repository.ts  # Query Supabase PostgreSQL terisolasi
        └── <modul>.openapi.ts     # Spesifikasi OpenAPI/Swagger endpoint modul ini
```

* **Entitas Inti Database (Supabase PostgreSQL `ap-southeast-1`):**
  * `profiles`: `id`, `display_name`, `avatar_url`, `created_at`, `updated_at`
  * `exam_packages`: `id`, `slug`, `title`, `description`, `category`, `duration_minutes`, `total_questions`, `passing_grade_twk`, `passing_grade_tiu`, `passing_grade_tkp`, `is_active`, `created_at`
  * `questions`: `id`, `package_id`, `subtest`, `question_text`, `image_url`, `options` (`JSONB` tanpa label A-E statis), `shuffle_options`, `explanation`, `created_at`
  * `scores`: `id`, `user_id`, `package_id`, `client_attempt_id`, `score_twk`, `score_tiu`, `score_tkp`, `score_skb`, `total_score`, `is_passed`, `duration_seconds`, `completed_at`
* **Alur Eksekusi Data (Strict Layering):**
  ```text
  Next.js Route Handler (src/app/api/*) ──> Controller ──> Service ──> Repository ──> Supabase PostgreSQL (RLS)
  ```
* **Colocation Spesifikasi API:** Skema dokumentasi API (`<modul>.openapi.ts`) wajib diletakkan langsung di dalam modul bersangkutan agar kontrak dokumentasi selalu sinkron saat kode endpoint diperbarui.
* **Larangan Ketat:**
  * Controller **dilarang** memanggil Repository secara langsung (wajib melalui Service).
  * Query Supabase / SQL **dilarang** ditulis di Controller maupun Service (wajib diisolasi di Repository).
  * Antar-modul dilarang mengakses Repository milik modul lain secara langsung (harus memanggil Service modul terkait).

### B.3. Anti-Overengineering (`ponytail`)
Terapkan prinsip *lazy senior dev* dari skill **`ponytail`** di dalam arsitektur FDA dan Repository Pattern:
* Jangan membuat interface, factory, atau abstract class kosong jika implementasinya hanya ada 1.
* Jangan memecah komponen 25 baris menjadi 4 file terpisah jika masih nyaman dibaca dalam 1 file.
* Jangan membuat lapisan wrapper DTO bertingkat jika tipe model data dari Zod/Supabase sudah jelas.
* Tulis kode yang langsung menyelesaikan masalah (*pragmatic, working code*), dan selalu sertakan unit test untuk logika non-trivial (`shuffle.ts`, `scoring.ts`, `scores.service.ts`).

### B.4. Keamanan Sistem Produksi (`security-audit`)
Patuhi standar skill **`security-audit`**:
* **Integritas Skor Leaderboard:** `POST /api/scores` tidak boleh mempercayai skor mentah dari client. Service wajib menghitung ulang skor dari `answers` terhadap data `questions` di database.
* **Sanitasi Input:** Validasi tipe dan sanitasi seluruh payload di Controller menggunakan `zod` (cegah SQLi, XSS, payload korup).
* **Otorisasi Ketat:** Verifikasi pengguna di Service menggunakan `supabase.auth.getUser()`, serta pertahankan RLS Supabase (`auth.uid() = user_id` untuk `INSERT` ke `scores` dan `UPDATE` ke `profiles`).
* **Proteksi Rahasia:** Dilarang keras menaruh credential, token, atau secret di kode sumber (gunakan *environment variables*).
* **Error Handling Aman:** Jangan mengekspos *stack trace* atau pesan error PostgreSQL internal ke response client.

### B.5. Larangan Keras Penggunaan RegEx (Zero RegEx Policy)
* **Dilarang Menggunakan RegEx:** Dilarang keras menulis atau menerapkan Regular Expression (`RegExp`, pola regex, atau sintaks `/pattern/`) dalam logika kode apa pun, baik di Frontend maupun Backend.
* **Alasan:** Mencegah kerentanan ReDoS (*Regular Expression Denial of Service*), beban komputasi yang tidak terduga, dan menjaga kode tetap mudah dibaca/di-debug.
* **Alternatif Wajib yang Harus Digunakan:**
  * Gunakan metode string bawaan (*native string methods*): `.includes()`, `.startsWith()`, `.endsWith()`, `.indexOf()`, `.split()`, `.slice()`, `.trim()`.
  * Untuk validasi format (email, URL, UUID): Gunakan `zod` (`z.string().email()`, `z.string().uuid()`) atau parser bawaan bahasa (`new URL()`).
  * Untuk parsing pola: Gunakan pemisahan berbasis delimiter (*tokenizing*) atau perulangan logika (*loop*) yang eksplisit.

---

## 4. Bagian C: Protokol Transisi (Desain FigCraft ke Kode)

Saat pengguna meminta pembuatan kode dari desain FigCraft yang sudah disetujui:
1. **Inspeksi:** Baca koordinat, warna, hierarki komponen dari FigCraft menggunakan `inspect_document` / `get_node`.
2. **Pemetaan ke FDA:** Ubah frame FigCraft menjadi struktur komponen modular di `src/features/<fitur>/components/`.
3. **Penyelarasan Desain:** Pertahankan token warna, rasio spasi 8pt, dan penamaan teks dari FigCraft ke dalam kode.
