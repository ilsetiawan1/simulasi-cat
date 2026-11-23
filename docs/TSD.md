# Simulasi CAT CPNS (`simulasi-cat`) - Technical Specifications Document (TSD)

Dokumen ini menjabarkan spesifikasi arsitektur, struktur modul, skema database, kontrak API, algoritma inti, dan batas keamanan untuk aplikasi **Simulasi CAT CPNS (`simulasi-cat`)** berdasarkan `docs/PRD.md`.

---

## 1. Stack Arsitektur & Teknologi

* **Frontend:** Next.js (App Router) + React + TypeScript (`strict: true`) dengan **Feature-Driven Architecture (FDA)**
* **Styling:** Tailwind CSS (mobile-first responsive, utility-first, tanpa runtime CSS-in-JS berat)
* **Backend API Layer:** Next.js Route Handlers (`src/app/api/*`) yang mendelegasikan eksekusi ke **Modular Layered Architecture dengan Repository Pattern** (`src/modules/*`)
* **Database, Auth & Storage:** Supabase PostgreSQL (Region: `ap-southeast-1` Singapore), Row Level Security (RLS), Supabase Auth (Google OAuth & Email), Supabase Storage (bucket publik `avatars` maks. 2 MB dengan RLS per folder `<user_id>/`)
* **Validasi Skema:** `zod` (digunakan pada seluruh batas input HTTP dan validasi payload `localStorage`, menggantikan RegEx)
* **Runtime & Package Manager:** Bun (`bun install`, `bun run`, `bun test`)
* **Testing:** `bun test` (unit test & API integration test untuk modul domain dan algoritma inti) + Playwright (End-to-End testing)
* **Deployment:** Vercel (Free Tier) + Supabase (Free Tier)
* **Design & Prototyping:** FigCraft Native

---

## 2. Aliran Arsitektur Sistem

```text
[Browser / Next.js Client]
   │
   ├── 1. Start Exam (1x Request): GET /api/packages/[slug]/questions
   │      └── Fisher-Yates Shuffle (Client) -> Snapshot ke localStorage
   │          (Navigasi soal 1..110 berjalan 100% lokal: 0ms network latency)
   │
   ├── 2a. Finish Exam (Guest Mode):
   │      └── Kalkulasi skor & passing grade di Client (Tanpa INSERT DB)
   │          └── Simpan pending payload ke localStorage untuk Guest-to-Auth Handoff
   │
   ├── 2b. Finish Exam (Authenticated User / Post-Login Handoff):
   │      └── POST /api/scores { packageId, answers, durationSeconds, clientAttemptId }
   │          └── Route Handler -> Controller (Zod) -> Service (Auth + Recalculate Score)
   │              -> Repository (Supabase Insert w/ RLS auth.uid() = user_id) -> PostgreSQL
   │
   └── 3. Leaderboard: GET /api/leaderboard?packageId=<uuid>
          └── Route Handler -> Controller -> Service -> Repository (Indexed Tie-Breaker Query)
```

---

## 3. Struktur Direktori & Modul Frontend (FDA)

Seluruh kode frontend dikelompokkan berdasarkan domain fitur di `src/features/`, dengan komponen atomik lintas fitur (`>= 3` fitur) di `src/components/ui/`.

```text
src/
├── app/                                 # Next.js App Router (entry points & route handlers)
│   ├── layout.tsx                       # Root layout, font setup, AuthProvider
│   ├── page.tsx                         # Landing Page & Katalog Tryout
│   ├── packages/[slug]/page.tsx         # Halaman Konfirmasi Ujian
│   ├── exam/[slug]/page.tsx             # Ruang Ujian CAT
│   ├── result/[slug]/page.tsx           # Halaman Hasil & Pembahasan
│   ├── leaderboard/page.tsx             # Papan Peringkat (dengan avatar peserta)
│   ├── aturan-bkn/page.tsx              # Informasi Aturan & Passing Grade BKN
│   ├── history/page.tsx                 # Riwayat Tryout Pribadi (Authenticated)
│   ├── profile/page.tsx                 # Profil Akun, Avatar Picker & Upload Storage (Authenticated)
│   ├── login/page.tsx                   # Halaman Masuk (Google OAuth & Email)
│   ├── register/page.tsx                # Halaman Daftar Akun
│   ├── robots.ts                        # SEO robots.txt dinamis
│   ├── sitemap.ts                       # SEO sitemap.xml dinamis (halaman publik + paket aktif)
│   ├── opengraph-image.tsx              # Dynamic OpenGraph preview image (1200x630)
│   ├── auth/callback/route.ts           # Supabase OAuth callback handler
│   └── api/                             # Thin Next.js Route Handlers -> panggil Module Controller
│       ├── packages/route.ts
│       ├── packages/[slug]/questions/route.ts
│       ├── scores/route.ts
│       ├── leaderboard/route.ts
│       └── profile/route.ts
├── components/
│   └── ui/                              # Button, Modal, Drawer, Card, Spinner, EmptyState
├── features/
│   ├── exam-catalog/                    # Katalog paket & halaman konfirmasi aturan ujian
│   │   ├── components/                  # PackageCard, PackageFilter, ExamRulesCard
│   │   ├── hooks/                       # useActiveSessionBadge
│   │   ├── api/                         # fetchPackages, fetchPackageBySlug
│   │   ├── types/                       # ExamPackage, ExamMode
│   │   └── index.ts
│   ├── cat-exam/                        # Ruang ujian CAT, randomization, timer, persistence
│   │   ├── components/                  # ExamHeaderTimer, QuestionView, OptionList, QuestionMatrix, MatrixDrawer, FinishConfirmModal
│   │   ├── hooks/                       # useExamSession, useCountdownTimer, useKeyboardShortcuts
│   │   ├── api/                         # fetchPackageQuestions
│   │   ├── types/                       # ExamSessionState, ShuffledQuestion, ShuffledOption
│   │   └── index.ts
│   ├── exam-result/                     # Evaluasi skor, passing grade, pembahasan, Guest CTA
│   │   ├── components/                  # ScoreSummaryCards, PassingGradeBanner, DiscussionList, GuestHandoffBanner
│   │   ├── hooks/                       # useGuestScoreHandoff
│   │   ├── api/                         # submitScore
│   │   ├── types/                       # ExamResultSummary, QuestionReviewItem
│   │   └── index.ts
│   ├── leaderboard/                     # Papan peringkat per paket & aturan tie-breaker
│   │   ├── components/                  # LeaderboardTable, PackageSelector
│   │   ├── hooks/                       # useLeaderboard
│   │   ├── api/                         # fetchLeaderboard
│   │   ├── types/                       # LeaderboardEntry
│   │   └── index.ts
│   └── auth/                            # Supabase Auth (Google OAuth, Email), session state, profil
│       ├── components/                  # LoginModal, UserMenu
│       ├── hooks/                       # useAuth
│       ├── api/                         # signInWithGoogle, signInWithEmail, signOut, updateProfile
│       ├── types/                       # UserProfile
│       └── index.ts
├── lib/                                 # Shared pure helpers & platform clients
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   └── server.ts                    # Server Supabase client (cookie-aware for RLS)
│   ├── exam-engine/                     # Pure functions dipakai frontend (Guest) & backend (Verified)
│   │   ├── shuffle.ts                   # Fisher-Yates shuffle (per blok subtes & opsi)
│   │   ├── scoring.ts                   # Kalkulasi skor SKD/SKB & passing grade KepmenPANRB 321/2024
│   │   └── __tests__/                   # Unit test shuffle & scoring
│   └── storage/
│       └── exam-storage.ts              # Safe localStorage reader/writer dengan validasi Zod
└── modules/                             # Backend Modular Layered Architecture (Repository Pattern)
```

---

## 4. Arsitektur Backend (Modular Layered Repository Pattern)

Logika backend berada di `src/modules/<nama-modul>/`. Route Handler Next.js (`src/app/api/.../route.ts`) hanya berfungsi sebagai adapter tipis ke `<modul>.controller.ts` (menggantikan `routes.ts` Express agar tetap pragmatis dengan App Router).

```text
src/
├── config/                              # env.ts (validasi env vars via Zod)
├── constants/                           # passing-grade.ts (KepmenPANRB 321/2024), subtest-order.ts
├── middlewares/                         # auth-guard.ts (requireAuth), error-handler.ts (safe JSON error)
├── utils/                               # http-response.ts
└── modules/
    ├── packages/
    │   ├── __tests__/
    │   ├── packages.controller.ts
    │   ├── packages.service.ts
    │   ├── packages.repository.ts
    │   └── packages.openapi.ts
    ├── questions/
    │   ├── __tests__/
    │   ├── questions.controller.ts
    │   ├── questions.service.ts
    │   ├── questions.repository.ts
    │   └── questions.openapi.ts
    ├── scores/
    │   ├── __tests__/
    │   ├── scores.controller.ts
    │   ├── scores.service.ts
    │   ├── scores.repository.ts
    │   └── scores.openapi.ts
    └── profiles/
        ├── __tests__/
        ├── profiles.controller.ts
        ├── profiles.service.ts
        ├── profiles.repository.ts
        └── profiles.openapi.ts
```

### Aturan Strict Layering
1. **Controller:** Membaca parameter/body HTTP, memvalidasi payload menggunakan `zod`, memanggil `Service`, dan mengembalikan JSON response terstandar. Dilarang memanggil `Repository` langsung.
2. **Service:** Menjalankan logika bisnis (verifikasi otorisasi `auth.getUser()`, kalkulasi ulang skor SKD/SKB dari jawaban mentah, evaluasi passing grade, penanganan idempotency submit skor). Dilarang menulis query Supabase/SQL secara langsung.
3. **Repository:** Mengisolasi seluruh pemanggilan Supabase query (`from(...).select(...)`, `.insert(...)`, `.update(...)`). Antar-modul dilarang mengakses Repository modul lain secara langsung (wajib lewat Service modul terkait, contohnya `scores.service.ts` memanggil `questions.service.ts` untuk mengambil kunci bobot skor soal).
4. **Colocation:** Setiap modul menyertakan `<modul>.openapi.ts` dan `__tests__/` agar spesifikasi endpoint dan pengujian selalu sinkron.

---

## 5. Skema Database & Entitas Inti (Supabase PostgreSQL)

### 5.1. Struktur Tabel (DDL)

```sql
-- 1. Tabel profiles (sinkron otomatis dengan auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel exam_packages (katalog paket SKD Penuh, Mini Tryout Subtes, SKB)
create table public.exam_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null check (category in ('SKD_FULL', 'MINI_TWK', 'MINI_TIU', 'MINI_TKP', 'SKB')),
  duration_minutes integer not null check (duration_minutes > 0),
  total_questions integer not null check (total_questions > 0),
  passing_grade_twk integer,
  passing_grade_tiu integer,
  passing_grade_tkp integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Tabel questions (bank soal dengan opsi JSONB tanpa huruf A-E statis)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.exam_packages(id) on delete cascade,
  subtest text not null check (subtest in ('TWK', 'TIU', 'TKP', 'SKB')),
  question_text text not null,
  image_url text,
  -- Format JSONB options:
  -- [{"id": "opt_1", "text": "Isi opsi...", "score": 5}, ...]
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  shuffle_options boolean not null default true,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

-- 4. Tabel scores (riwayat skor & sumber data Leaderboard)
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.exam_packages(id) on delete cascade,
  client_attempt_id uuid not null,
  score_twk integer not null default 0 check (score_twk >= 0),
  score_tiu integer not null default 0 check (score_tiu >= 0),
  score_tkp integer not null default 0 check (score_tkp >= 0),
  score_skb integer not null default 0 check (score_skb >= 0),
  total_score integer not null check (total_score >= 0),
  is_passed boolean not null default false,
  duration_seconds integer not null check (duration_seconds >= 0),
  completed_at timestamptz not null default now(),
  unique (user_id, client_attempt_id)
);
```

### 5.2. Indeks Kinerja

```sql
-- Pengambilan 1x request seluruh soal dalam 1 paket
create index idx_questions_package_subtest
  on public.questions (package_id, subtest);

-- Query Leaderboard dengan aturan tie-breaker BKN:
-- Total Skor DESC -> TKP DESC -> TIU DESC -> TWK DESC -> Waktu Submit ASC
create index idx_scores_leaderboard_rank
  on public.scores (package_id, total_score desc, score_tkp desc, score_tiu desc, score_twk desc, completed_at asc);

-- Query riwayat tryout pribadi per user
create index idx_scores_user_history
  on public.scores (user_id, completed_at desc);
```

### 5.3. Trigger Auto-Create Profile

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_name text;
begin
  raw_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, 'Peserta'), '@', 1)
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(raw_name, 60),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5.4. Kebijakan Row Level Security (RLS)

```sql
alter table public.profiles enable row level security;
alter table public.exam_packages enable row level security;
alter table public.questions enable row level security;
alter table public.scores enable row level security;

-- profiles: publik boleh baca display_name untuk leaderboard; user hanya boleh update profil sendiri
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- exam_packages: read-only publik untuk paket aktif
create policy "packages_select_active" on public.exam_packages
  for select using (is_active = true);

-- questions: read-only publik (anon & authenticated)
create policy "questions_select_public" on public.questions
  for select using (true);

-- scores: publik boleh baca leaderboard; INSERT hanya untuk authenticated milik sendiri
create policy "scores_select_public" on public.scores
  for select using (true);

create policy "scores_insert_own" on public.scores
  for insert to authenticated
  with check (auth.uid() = user_id);
```

---

## 6. Kontrak API

Seluruh endpoint mengembalikan format respons JSON konsisten:
* Sukses: `{ "data": <payload> }`
* Gagal: `{ "error": { "code": "<ERROR_CODE>", "message": "<pesan aman untuk user>" } }`

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/packages` | Publik | Mengambil daftar paket tryout aktif (opsional query `?category=SKD_FULL`). |
| `GET` | `/api/packages/[slug]/questions` | Publik | Mengambil metadata paket dan seluruh soal dalam 1 request untuk memulai sesi ujian. |
| `POST` | `/api/scores` | Authenticated | Menerima `{ packageId, clientAttemptId, answers, durationSeconds }`, menghitung ulang skor di server, lalu menyimpan ke tabel `scores`. |
| `GET` | `/api/scores/me` | Authenticated | Mengambil riwayat skor tryout pribadi milik user yang sedang login. |
| `GET` | `/api/leaderboard` | Publik | Mengambil papan peringkat berdasarkan `?packageId=<uuid>&limit=50` yang sudah terurut sesuai tie-breaker. |
| `PATCH` | `/api/profile` | Authenticated | Memperbarui `display_name` milik user yang sedang login. |

---

## 7. Spesifikasi Algoritma & Logika Inti

### 7.1. Randomization Engine (`src/lib/exam-engine/shuffle.ts`)
* Menggunakan **Fisher-Yates Shuffle** (in-place pada salinan array agar pure function).
* **Urutan Blok SKD Penuh:**
  1. Pisahkan soal paket menjadi 3 array: `twkQuestions`, `tiuQuestions`, `tkpQuestions`.
  2. Acak masing-masing array secara terpisah dengan Fisher-Yates.
  3. Gabungkan secara berurutan: `[...shuffledTwk, ...shuffledTiu, ...shuffledTkp]` sehingga nomor 1-30 selalu TWK, 31-65 TIU, dan 66-110 TKP.
* **Pengacakan Opsi Jawaban:**
  * Jika `question.shuffle_options === true`, acak array `options` menggunakan Fisher-Yates sebelum disimpan ke snapshot sesi.
  * Jika `question.shuffle_options === false`, pertahankan urutan asli `options`.
  * Label huruf `['A', 'B', 'C', 'D', 'E']` dipetakan saat render dari indeks array `0..4`.

### 7.2. Anti-Refresh State Persistence (`src/lib/storage/exam-storage.ts`)
* Key `localStorage` sesi aktif: `simulasi_cat:session:<packageSlug>`
* Key `localStorage` hasil pending Guest: `simulasi_cat:pending_result`
* Struktur snapshot sesi aktif:
  ```ts
  type ExamSessionState = {
    version: 1;
    clientAttemptId: string;        // UUID dibuat saat klik Mulai Ujian
    packageId: string;
    packageSlug: string;
    startedAt: number;              // Unix epoch ms
    endTimestamp: number;           // startedAt + durationMinutes * 60_000
    currentIndex: number;           // Indeks soal aktif (0..N-1)
    questionOrder: string[];        // Array question.id hasil acakan
    optionOrders: Record<string, string[]>; // questionId -> array option.id hasil acakan
    answers: Record<string, string>;        // questionId -> selected option.id
    flaggedIds: string[];           // Array question.id bertanda Ragu-ragu
  };
  ```
* Saat halaman ujian dimuat, sistem membaca dan memvalidasi snapshot menggunakan Zod. Jika korup atau versi tidak cocok, snapshot dibersihkan dan sesi baru dibuat secara aman.
* Timer dihitung dari `Math.max(0, endTimestamp - Date.now())` pada interval 1 detik (bukan decrement counter) sehingga akurat meskipun tab browser di-throttle atau di-refresh.

### 7.3. Kalkulasi Skor & Passing Grade (`src/lib/exam-engine/scoring.ts`)
* Fungsi pure `calculateExamScore(packageInfo, questions, answers)` dipakai bersama di:
  * **Client (Guest Mode):** untuk menampilkan skor & pembahasan instan tanpa `INSERT` ke DB.
  * **Server (`scores.service.ts`):** untuk menghitung ulang skor secara otoritatif sebelum `INSERT` ke tabel `scores`.
* Aturan SKD Penuh (KepmenPANRB No. 321 Tahun 2024):
  * `TWK`: penjumlahan `option.score` (5 jika benar, 0 jika salah/kosong). Lulus jika `scoreTwk >= 65`.
  * `TIU`: penjumlahan `option.score` (5 jika benar, 0 jika salah/kosong). Lulus jika `scoreTiu >= 80`.
  * `TKP`: penjumlahan `option.score` (1 s.d. 5, 0 jika kosong). Lulus jika `scoreTkp >= 166`.
  * `totalScore = scoreTwk + scoreTiu + scoreTkp`.
  * `isPassed = scoreTwk >= 65 && scoreTiu >= 80 && scoreTkp >= 166`.
* Aturan SKB:
  * `scoreSkb`: penjumlahan `option.score` (+5 benar, 0 salah/kosong). `totalScore = scoreSkb`.

### 7.4. Guest-to-Auth Handoff & Idempotency
* Saat Guest menyelesaikan ujian, sistem menyimpan `{ clientAttemptId, packageId, packageSlug, answers, durationSeconds, completedAt }` ke `simulasi_cat:pending_result`.
* Setelah login berhasil, hook `useGuestScoreHandoff` membaca pending payload, mengirim `POST /api/scores`, lalu menghapus `simulasi_cat:pending_result` ketika respons `201 Created` atau `200 OK` (sudah tersimpan).
* Constraint `unique (user_id, client_attempt_id)` pada tabel `scores` menjamin tidak ada duplikasi skor meskipun request terpicu dua kali (misalnya akibat double-mount React StrictMode atau retry jaringan).

---

## 8. Keamanan & Trust Boundaries (`security-audit`)

1. **Integritas Leaderboard:** Endpoint `POST /api/scores` menolak input skor mentah dari client. Server hanya menerima `answers` (`questionId -> optionId`) dan menghitung skor dari data `questions` di database.
2. **Otorisasi di Server & Database:** `scores.service.ts` memverifikasi sesi menggunakan `supabase.auth.getUser()` (bukan hanya `getSession()` yang membaca cookie tanpa verifikasi token), dan operasi tulis tetap tunduk pada RLS `auth.uid() = user_id`.
3. **Sanitasi & Validasi Input:** Semua request body dan query parameter divalidasi dengan `zod` di Controller sebelum menyentuh Service.
4. **Proteksi Rahasia:** Kunci Supabase hanya disimpan di environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). `SUPABASE_SERVICE_ROLE_KEY` tidak digunakan pada request client atau route publik.
5. **Error Handling Aman:** Error database PostgreSQL/Supabase tidak pernah dikembalikan mentah ke client; `error-handler.ts` memetakan error internal menjadi pesan generik dan kode status HTTP yang tepat.

---

## 9. Batasan & Standar Koding Wajib

* **Zero RegEx Policy:** Dilarang keras menggunakan `RegExp` atau sintaks `/pattern/` di seluruh kode frontend maupun backend. Gunakan `zod` (`z.string().email()`, `z.string().uuid()`) dan metode string bawaan (`.includes()`, `.startsWith()`, `.split()`, `.trim()`).
* **Pragmatisme Kode (`ponytail`):** Jangan membuat interface, factory, atau wrapper DTO berlapis jika implementasinya hanya satu. Gunakan tipe TypeScript langsung dari skema Zod atau hasil query.
* **Standar UI & Mobile (`antislop-ui`, `antislop-layoutmobile`, `antislop-copywriting`):**
  * Tidak ada decorative emoji di teks antarmuka, tidak ada pill/badge soup, tidak ada animasi loop tanpa tujuan.
  * Target sentuh mobile minimal `44 x 44 px`, reflow 3 tahap (mobile, tablet, desktop), tanpa horizontal scroll leak.
  * Setiap layar data menyediakan empty state, loading state, dan error state yang jelas.
* **Pengujian Wajib:** Setiap logika non-trivial (`shuffle.ts`, `scoring.ts`, `scores.service.ts` tie-breaker & handoff) wajib memiliki unit test di `__tests__/` untuk memverifikasi edge case (jawaban kosong, batas tepat passing grade `65/80/166`, `shuffle_options = false`, dan idempotency submit).
