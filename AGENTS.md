# [NAMA APLIKASI] — Standar Terpadu Desain & Pengembangan Proyek

> **Metadata Proyek:**
> - **Nama Aplikasi:** [Masukkan Nama Aplikasi / Sistem]
> - **Dokumen Rujukan:** `docs/PRD.md` (Product Requirements Document) & `docs/TSD.md` (Technical Specifications Document)
> - **Pola Arsitektur:** Frontend (Feature-Driven Architecture) • Backend (Repository Pattern)
> - **Alat Desain:** FigCraft (Canvas Control via Localhost 7979)

---

## 0. Instruksi Inisialisasi Proyek (Agent Setup Directive)

Setiap kali memulai project baru atau membuka workspace ini:
1. **Analisis Dokumen Fondasi:**  
   Agent **WAJIB membaca dan menganalisis file `docs/PRD.md` dan `docs/TSD.md`** (atau template terkait di folder `docs/`) sebelum mengambil tindakan apa pun.
2. **Perbarui `AGENTS.md` Ini Secara Mandiri (*Self-Update*):**  
   Berdasarkan hasil analisis dokumen di folder `docs/`, Agent harus memperbarui placeholder dokumen ini:
   * Ganti `[NAMA APLIKASI]` dengan nama resmi aplikasi.
   * Daftarkan daftar fitur utama dan modul domain pada bagian arsitektur FDA.
   * Daftarkan entitas inti database pada bagian Repository Pattern.
3. **Kepatuhan Terhadap PRD & TSD:**  
   Seluruh rancangan antarmuka di FigCraft dan kode yang dihasilkan tidak boleh menyimpang dari batasan fungsional pada PRD dan batasan teknis pada TSD.

---

## 1. Standar Workflow Git & GitHub

Untuk menjaga kode tetap terisolasi, stabil, dan bersih:
* **Larangan Commit Langsung:** Dilarang keras melakukan commit langsung ke branch utama (`main` atau `master`).
* **Isolasi Fitur Baru:** Setiap mulai mengerjakan fitur, modul, atau perbaikan baru, wajib membuat branch terisolasi dari branch `main`:
  * Fitur baru: `feat/<nama-fitur>` (contoh: `feat/checkout-flow`)
  * Perbaikan bug: `fix/<nama-bug>` (contoh: `fix/tax-calculation-rounding`)
  * Refaktorisasi: `refactor/<nama-modul>` (contoh: `refactor/order-repository`)
* **Konvensi Pesan Commit (Conventional Commits):**  
  Gunakan awalan baku: `feat:`, `fix:`, `refactor:`, `style:`, `test:`, `docs:`.
* **Protokol:** Konfirmasi atau laporkan nama branch yang dibuat kepada pengguna sebelum mulai memodifikasi kode.

---

## 2. Bagian A: Standar Desain UI/UX (FigCraft Workflow)

Aturan ini aktif saat Agent diminta membuat, merancang, atau merevisi visual di kanvas FigCraft.

### A.1. Integrasi Skills Desain
* **`antislop-ui`**: Wajib dipatuhi untuk menjaga desain tetap bernapas (*airy*), modern, minimalis, dan bebas dari tampilan klise AI.
* **`antislop-layoutmobile`**: Wajib dipatuhi saat membuat frame layar ponsel (target sentuh $\ge 44 \times 44$ px, form terpusat/centered).
* **`antislop-copywriting`**: Wajib dipatuhi untuk teks tombol, label, dan dialog agar singkat, jelas, dan natural.

### A.2. Aturan Estetika & Anti-AI Slop
* **Bebas Pill/Badge Soup:** Dilarang membungkus setiap teks atau status ke dalam kotak/badge kapsul berwarna-warni pekat. Gunakan indikator minimalis: satu titik warna 6px di samping teks netral.
* **Tipografi & Hirarki Brand:**
  * **Logo/Brand:** Wajib menggunakan font display geometris berbeda (*Poppins*, *Plus Jakarta Sans*, atau *Outfit*) dengan *letter-spacing* tegas agar ter-highlight dari konten lainnya.
  * **Konten & Body:** Gunakan font antarmuka netral (*Inter*).
  * **Bebas Teks Fluff:** Hilangkan teks pemasaran, jargon AI, atau kutipan panjang pada antarmuka fungsional.
* **Efek Kaca (*Glassmorphism*):**  
  Gunakan refraksi halus: `backgroundBlur` (radius 20–36px), isian putih transparan (`#FFFFFFB8` – `#FFFFFFEE`), border tipis 1px, dan drop shadow lembut. Kontras teks wajib memenuhi $\ge 4.5:1$.

### A.3. Operasional Kanvas
* **Penamaan Frame Wajib Jelas:** Format: `[Nama Layar] - (Desktop 1440x900)` atau `[Nama Layar] - (Mobile 390x844)`.
* **Generasi Bertahap (*Live Generation*):** Buat komponen per blok logis (Background $\rightarrow$ Kontainer $\rightarrow$ Navigasi $\rightarrow$ Konten $\rightarrow$ Aksi) agar pengguna dapat memantau prosesnya di layar.
* **Auto-Save:** Panggil `save_file` setelah menyelesaikan revisi kanvas utama.

---

## 3. Bagian B: Standar Pengembangan Kode (Full-Stack Engineering)

Aturan ini aktif saat Agent diminta mengimplementasikan kode aplikasi frontend maupun backend.

### B.1. Frontend: Feature-Driven Architecture (FDA)
Seluruh kode frontend wajib dikelompokkan berdasarkan **domain fitur/bisnis**:
```text
src/
├── features/
│   └── <nama-fitur>/
│       ├── components/    # Komponen visual khusus fitur ini
│       ├── hooks/         # Custom hooks khusus fitur ini
│       ├── api/           # Request fetch/axios ke endpoint fitur
│       ├── types/         # Interface / tipe TypeScript khusus fitur
│       └── index.ts       # Public API resmi yang boleh diakses fitur lain
└── components/
    └── ui/                # Komponen atomik bersama (Button, Input, Modal)
```
* Komponen atomik yang dipakai di $\ge 3$ fitur diletakkan di `src/components/ui/`.
* Dilarang melakukan ketergantungan melingkar (*circular dependency*) antar folder fitur.

### B.2. Backend: Repository Pattern 3-Lapis
Arsitektur backend wajib memisahkan tanggung jawab secara ketat:
```text
1. Controller / Handler  --> Tangani request HTTP, validasi skema input, kirim response.
          ↓
2. Service / Usecase     --> Menampung seluruh logika bisnis, transaksi, otorisasi.
          ↓
3. Repository            --> Menangani query database, ORM, dan pemetaan data mentah.
```
* **Larangan:** Controller **dilarang** memanggil Repository langsung. Query SQL/Database **dilarang** ada di Controller atau Service.

### B.3. Anti-Overengineering (`ponytail`)
Terapkan prinsip *lazy senior dev* dari skill **`ponytail`** di dalam arsitektur FDA dan Repository Pattern:
* Jangan membuat interface, factory, atau abstract class kosong jika implementasinya hanya ada 1.
* Jangan memecah komponen 25 baris menjadi 4 file terpisah jika masih nyaman dibaca dalam 1 file.
* Jangan membuat lapisan wrapper DTO bertingkat jika tipe model data sudah jelas.
* Tulis kode yang langsung menyelesaikan masalah (*pragmatic, working code*).

### B.4. Keamanan Sistem Produksi (`security-audit`)
Patuhi standar skill **`security-audit`**:
* **Sanitasi Input:** Validasi tipe dan sanitasi seluruh payload di Controller & Service (cegah SQLi, XSS, NoSQLi).
* **Otorisasi Ketat:** Validasi izin hak akses (*RBAC / permissions*) di lapisan Service, bukan hanya di frontend.
* **Proteksi Rahasia:** Dilarang keras menaruh credential, token, atau secret di kode sumber (gunakan *environment variables*).
* **Error Handling Aman:** Jangan mengekspos *stack trace* database internal ke response client.

### B.5. Larangan Keras Penggunaan RegEx (Zero RegEx Policy)
* **Dilarang Menggunakan RegEx:** Dilarang keras menulis atau menerapkan Regular Expression (`RegExp`, pola regex, atau sintaks `/pattern/`) dalam logika kode apa pun, baik di Frontend maupun Backend.
* **Alasan:** Mencegah kerentanan ReDoS (*Regular Expression Denial of Service*), beban komputasi yang tidak terduga, dan menjaga kode tetap mudah dibaca/di-debug.
* **Alternatif Wajib yang Harus Digunakan:**
  * Gunakan metode string bawaan (*native string methods*): `.includes()`, `.startsWith()`, `.endsWith()`, `.indexOf()`, `.split()`, `.slice()`.
  * Untuk validasi format (email, URL, UUID): Gunakan library skema validator resmi (misal: `zod`, `validator.js`) atau parser bawaan bahasa (misal: `new URL()`).
  * Untuk parsing pola: Gunakan pemisahan berbasis delimiter (*tokenizing*) atau perulangan logika (*loop*) yang eksplisit dan mudah dipahami.

---

## 4. Bagian C: Protokol Transisi (Desain FigCraft ke Kode)

Saat pengguna meminta pembuatan kode dari desain FigCraft yang sudah disetujui:
1. **Inspeksi:** Baca koordinat, warna, hierarki komponen dari FigCraft menggunakan `inspect_document` / `get_node`.
2. **Pemetaan ke FDA:** Ubah frame FigCraft menjadi struktur komponen modular di `src/features/<fitur>/components/`.
3. **Penyelarasan Desain:** Pertahankan token warna, rasio spasi 8pt, dan penamaan teks dari FigCraft ke dalam kode.
