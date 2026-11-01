# My Agent Template

> **Unified Standard for AI-Assisted Full-Stack Engineering & UI/UX Design**  
> Standar terpadu pengembangan perangkat lunak modern yang menyatukan alur kebutuhan produk (**PRD**), spesifikasi teknis (**TSD**), perancangan antarmuka visual (**FigCraft**), dan implementasi kode skala produksi (**FDA** & **Modular Layered Repository Pattern**).

---

## 📌 Gambaran Umum (Overview)

Repository ini dirancang sebagai **starter template mandiri** untuk memulai proyek web full-stack profesional dengan bantuan AI Coding Agent (seperti Google Antigravity, Cursor, Windsurf, atau Claude Code). 

Template ini mengeliminasi masalah umum pada proyek berbasis AI:
* **Mencegah kode berantakan (*spaghetti code*)** dengan arsitektur modular yang ketat di frontend dan backend.
* **Mencegah tampilan antarmuka generik (*AI slop*)** dengan standar estetika desain berbasis human-crafted.
* **Menghilangkan risiko keamanan ReDoS** melalui kebijakan baku *Zero RegEx Policy*.
* **Menjaga sinkronisasi tim** melalui siklus hidup formal: PRD $\rightarrow$ TSD $\rightarrow$ Prototype Visual $\rightarrow$ Kontrak API $\rightarrow$ Implementasi Kode.

---

## 🏛️ Fondasi Arsitektur Sistem

Template ini menerapkan standar pemisahan tanggung jawab (*separation of concerns*) yang teruji di industri enterprise:

### 1. Frontend: Feature-Driven Architecture (FDA)
Seluruh kode antarmuka dikelompokkan berdasarkan **domain fitur bisnis pengguna**, bukan berdasarkan kategori file teknis:
```text
src/
├── components/ui/       # Komponen atomik bersama lintas fitur (Button, Input, Modal)
├── features/
│   └── <nama-fitur>/    # Contoh: auth, checkout, product-catalog
│       ├── components/  # Komponen visual internal fitur ini
│       ├── hooks/       # Custom hooks & state management internal
│       ├── api/         # Request fetch/axios ke endpoint terkait
│       ├── types/       # TypeScript types & interface domain ini
│       └── index.ts     # Public API resmi (hanya ini yang boleh diimpor fitur lain)
└── app/                 # Entry point & routing halaman
```

### 2. Backend: Modular Layered Architecture dengan Repository Pattern
Seluruh kode backend dikelompokkan ke dalam modul fitur mandiri (*Modular Monolith / Vertical Slice*), dengan pemisahan aliran data 4 lapis yang ketat:
```text
src/
├── config/              # Konfigurasi database, env, server
├── constants/           # Nilai konstan global & enum
├── middlewares/         # Auth guard, error handler, rate limit
├── utils/               # Helper murni bersama lintas modul
└── modules/
    └── <nama-modul>/    # Contoh: article, auth, reservation, room
        ├── __tests__/           # Unit & integration test khusus modul ini
        ├── <modul>.routes.ts    # Definisi routing URL & HTTP method
        ├── <modul>.controller.ts# Penanganan HTTP req/res & validasi DTO
        ├── <modul>.service.ts   # Logika bisnis murni, kalkulasi, transaksi DB
        ├── <modul>.repository.ts# Query SQL/ORM dan akses langsung database
        └── <modul>.openapi.ts   # Kontrak OpenAPI/Swagger (Colocated spec)
```
* **Aliran Data Baku:**  
  `Client Request` $\longrightarrow$ `Routes` $\longrightarrow$ `Controller` $\longrightarrow$ `Service` $\longrightarrow$ `Repository` $\longrightarrow$ `Database`.
* **Colocation Pattern:** Dokumentasi API (`*.openapi.ts`) dan pengujian (`__tests__/`) diletakkan berdampingan langsung dengan kodenya agar kontrak selalu sinkron saat ada perubahan.

### 3. UI/UX Design & FigCraft Standards
Perancangan antarmuka di FigCraft (localhost:7979) wajib mematuhi:
* **Anti-AI Slop:** Bebas dari elemen klise seperti pembungkus kapsul warna-warni (*pill-soup*), teks pemasaran kosong (*fluff*), dan kontras rendah.
* **Tipografi Berjenjang:** Font display geometris (*Poppins*, *Plus Jakarta Sans*, *Outfit*) untuk identitas brand/logo, dan font netral (*Inter*) untuk konten fungsional.
* **Ergonomi Layar:** Target sentuh mobile $\ge 44 \times 44$ px dan card form terpusat (*centered layout*).

### 4. Prinsip Engineering & Keamanan
* **Zero RegEx Policy:** Dilarang keras menulis Regular Expression (`RegExp` / `/pattern/`). Seluruh manipulasi string wajib menggunakan *native string methods* (`.includes()`, `.startsWith()`, `.split()`), dan validasi format wajib menggunakan parser teruji (`zod`, `new URL()`) untuk mencegah celah ReDoS (*Regular Expression Denial of Service*).
* **Pragmatic Code (`ponytail`):** Menolak *over-engineering* — tidak membuat interface/factory kosong jika implementasinya hanya satu.
* **Keamanan Produksi (`security-audit`):** Sanitasi input di controller, otorisasi RBAC di service, tidak mengekspos stack trace database, dan proteksi credential via environment variables.

---

## 📂 Struktur Repositori

```text
my-agent-template/
├── docs/
│   ├── PRD-template.md      # Template Product Requirements Document (MoSCoW, User Journey, NFR)
│   └── TSD-template.md      # Template Technical Specifications (Stack, Skema DB, API, FDA/Backend)
├── .gitignore               # Standard ignore file (Node, OS, logs)
├── AGENTS.md                # Dokumen aturan dan instruksi utama untuk AI Agent
└── README.md                # Dokumentasi panduan penggunaan template
```

---

## 🚀 Alur Kerja Proyek (Step-by-Step Lifecycle)

```
[1. Buat Repo dari Template]
            │
            ▼
[2. Tulis docs/PRD.md] ────────> Mendefinisikan kebutuhan bisnis & user journey
            │
            ▼
[3. Desain UI di FigCraft] ────> Memvisualisasikan input form, data display, dan interaksi
            │
            ▼
[4. Tulis docs/TSD.md] ────────> Menyusun skema DB, arsitektur modul, dan kontrak API
            │
            ▼
[5. Sinkronisasi AGENTS.md] ───> AI Agent membaca PRD/TSD dan memperbarui panduannya
            │
            ▼
[6. Eksekusi Koding Paralel] ──> Frontend (FDA) & Backend (Modular Layered Repository)
```

---

## 🛠️ Cara Menggunakan Template Ini

### Langkah 1: Jadikan Template di GitHub
1. Masuk ke halaman repository [`ilsetiawan1/my-agent-template`](https://github.com/ilsetiawan1/my-agent-template).
2. Buka tab **Settings** $\rightarrow$ pada bagian **General**, centang kotak **"Template repository"**.

### Langkah 2: Membuat Proyek Baru
1. Di halaman utama repository, klik tombol hijau **"Use this template"** $\rightarrow$ pilih **"Create a new repository"**.
2. Beri nama repository sesuai proyek barumu (contoh: `pos-restaurant-app`), lalu clone ke komputermu.

### Langkah 3: Menyiapkan Dokumen Spesifikasi
1. Masuk ke folder `docs/`:
   * Salin atau ubah nama `PRD-template.md` menjadi `PRD.md`.
   * Salin atau ubah nama `TSD-template.md` menjadi `TSD.md`.
2. Isi target fungsionalitas aplikasimu pada kedua file tersebut.

### Langkah 4: Instruksi Inisialisasi ke AI Agent
Buka terminal chat AI Coding Assistant kamu (misalnya Google Antigravity), lalu berikan prompt berikut:

```text
Halo Agent, saya baru saja menginisialisasi project baru ini. 
Tolong baca dan analisis file docs/PRD.md dan docs/TSD.md, kemudian perbarui 
dokumen AGENTS.md secara mandiri agar sesuai dengan nama aplikasi, fitur FDA, 
dan modul backend pada project ini.
```

Agent akan otomatis:
1. Membaca kebutuhan bisnis dan batasan teknis dari folder `docs/`.
2. Mengisi metadata proyek di `AGENTS.md`.
3. Mendaftarkan modul backend (`src/modules/<fitur>/`) dan modul frontend (`src/features/<fitur>/`).
4. Siap bekerja mengikuti seluruh guardrail dan standar kualitas tanpa keluar jalur.

---

## 🌿 Standar Git & Branching

Untuk menjaga stabilitas kode produksi:
* **Larangan Commit Langsung:** Dilarang melakukan commit langsung ke branch `main`.
* **Isolasi Fitur Baru:**
  * Fitur baru: `feat/<nama-fitur>` (contoh: `feat/room-reservation`)
  * Perbaikan bug: `fix/<nama-bug>` (contoh: `fix/pricing-discount-rounding`)
  * Refaktorisasi: `refactor/<nama-modul>` (contoh: `refactor/article-repository`)
* **Format Pesan Commit:** Gunakan [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).

---

## 📄 Lisensi

Repository ini berlisensi bebas untuk digunakan sebagai fondasi proyek personal, startup, maupun komersial.
