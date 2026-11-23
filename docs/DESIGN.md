# Simulasi CAT CPNS (`simulasi-cat`) - Design System (`DESIGN.md`)

Dokumen ini menjadi acuan tunggal (*single source of truth*) untuk perancangan UI di **FigCraft** dan implementasi **Tailwind CSS** pada aplikasi **Simulasi CAT CPNS (`simulasi-cat`)**.

---

## 1. Arah Visual & Karakter Desain (Warm Paper Editorial)

Desain `simulasi-cat` mengadopsi gaya **Warm Paper Editorial** yang taktil, ramah, namun fokus untuk keterbacaan ujian CAT:

* **Permukaan Kertas Hangat:** Latar utama menggunakan warna kertas lembut (`#F4F3EE`) dan kartu krem/putih (`#FAF9F5` / `#FFFFFF`) dengan garis tepi tinta hitam tegas (`1.5px solid #181816`) serta *hard offset shadow* khas buku catatan digital.
* **Tipografi Kontras Monospace + Sans-Serif:** Judul utama (*Hero* & *Section Heading*) menggunakan font **monospace** (`JetBrains Mono` / `Space Mono`) bergaya mesin tik modern, dipadukan dengan font **sans-serif** bersih (`Inter`) untuk navigasi, judul kartu, tombol, dan teks soal CAT.
* **Motif Highlight Seleksi Hijau:** Kata kunci penting pada judul diberi kotak sorotan hijau lembut (`#CBE8B4`) lengkap dengan garis batas kiri-kanan dan titik *selection handle* hijau (`#43A018`).
* **Aset Ilustrasi Line-Art Monokrom:** Ilustrasi menggunakan gaya sketsa garis hitam-putih minimalis (*Notion-style editorial line-art*) dengan stroke `#181816`, tanpa gradasi mencolok atau ilustrasi 3D generik.
* **Struktur Halaman Utama:**
  * **`Home` (Single Page):** Hero Section (headline + quick-feature pill bar + 3 kartu miring bergaya *stacked note*), Section Katalog Paket, Section Cara Kerja (4 langkah), dan Footer.
  * **`Papan Peringkat` (Halaman Terpisah):** Pemilih paket dan tabel peringkat dengan aturan tie-breaker BKN.
  * **`Aturan BKN` (Halaman Terpisah):** Panduan resmi standar KepmenPANRB No. 321 Tahun 2024 (passing grade, bobot SKD/SKB, pengacakan Fisher-Yates, dan tie-breaker).
  * **Alur Ujian (`Konfirmasi Ujian`, `Ruang Ujian CAT`, `Hasil & Pembahasan`):** Menggunakan palet kertas hangat, tinta hitam, dan aksen hijau yang sama agar konsisten dari halaman depan hingga ruang ujian.

---

## 2. Token Warna (Color System)

### 2.1. Surfaces & Borders
| Token | Hex | Kegunaan |
| :--- | :--- | :--- |
| `bg-paper` | `#F4F3EE` | Latar belakang utama seluruh halaman |
| `bg-card` | `#FAF9F5` | Latar kartu taktil (Hero cards, Katalog, Cara Kerja, Soal CAT) |
| `bg-pure` | `#FFFFFF` | Latar input, tabel, dan area baca soal berfokus tinggi |
| `bg-pill-bar` | `#EAE8E1` | Latar bar ringkas di bawah Hero & header tabel netral |
| `border-ink` | `#181816` | Garis tepi utama kartu (`1.5px`), tombol outline, dan *hard offset shadow* |
| `border-subtle` | `#D6D4CC` | Garis pemisah internal tabel, divider footer, batas opsi belum dipilih |

### 2.2. Brand Accent (Selection Green)
| Token | Hex | Kegunaan | Aturan Kontras |
| :--- | :--- | :--- | :--- |
| `accent-green` | `#43A018` | Tombol CTA primer (`Mulai SKD`), handle seleksi judul, indikator aktif | Teks `#FFFFFF` (rasio `4.7:1`, AA) |
| `accent-green-hover` | `#358412` | Hover tombol primer | Teks `#FFFFFF` |
| `accent-green-highlight` | `#CBE8B4` | Latar *inline selection highlight* pada headline & highlight baris #1 | Teks wajib `#181816` (rasio `12.6:1`, AAA) |
| `accent-green-soft` | `#E6F4DC` | Latar status terjawab / lulus passing grade | Teks `#26660B` |

### 2.3. Typography Ink
| Token | Hex | Kegunaan |
| :--- | :--- | :--- |
| `ink-primary` | `#181816` | Headline monospace, judul kartu, teks soal CAT, tombol outline |
| `ink-secondary` | `#575650` | Deskripsi, subjudul, teks pembahasan |
| `ink-muted` | `#787770` | Kicker uppercase kecil di atas judul kartu, metadata sekunder |

### 2.4. Semantic Colors (Status CAT & Passing Grade)
| Status | Background | Border | Text / Dot |
| :--- | :--- | :--- | :--- |
| **Terjawab / Lulus PG** | `#E6F4DC` | `#43A018` | `#26660B` |
| **Ragu-ragu** | `#FEF3C7` | `#D97706` | `#92400E` |
| **Belum Dijawab** | `#FAF9F5` | `#C7C5BC` | `#575650` |
| **Aktif (Sedang Dibuka)** | `#43A018` | `#181816` (2px) | `#FFFFFF` |
| **Tidak Lulus / Salah** | `#FEE2E2` | `#DC2626` | `#991B1B` |

---

## 3. Tipografi (Typography Scale)

* **Display & Heading Font:** `Space Mono` / `JetBrains Mono` (Regular `400` untuk Hero agar tetap lapang seperti referensi; Bold `700` untuk sub-angka & timer CAT `tabular-nums`).
* **UI, Card Title & Body Font:** `Inter` (SemiBold `600` untuk judul kartu & tombol, Regular `400` untuk isi soal & paragraf).

| Role | Font | Desktop | Mobile | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | Space Mono / JetBrains Mono | `50px` | `30px` | `400` (Regular) | `1.2` |
| **Section H2** | Space Mono / JetBrains Mono | `32px` | `24px` | `400` / `700` | `1.25` |
| **Card Title H3** | Inter | `20px` | `18px` | `600` (SemiBold) | `1.3` |
| **Card Kicker** | Inter | `11px` | `10px` | `600` (Uppercase) | `1.3` |
| **Nav & Button** | Inter | `14px` | `14px` | `500` / `600` | `1.2` |
| **Teks Soal CAT** | Inter | `16px` | `15px` | `400` (Regular) | `1.65` |
| **Body Default** | Inter | `15px` | `14px` | `400` (Regular) | `1.6` |

---

## 4. Elevasi, Radius & Pola Komponen

* **Tactile Card Shadow (Ciri Khas Referensi):**
  * Border `1.5px solid #181816`, radius `20px`–`24px`, dan *hard offset shadow* solid `#181816` (`offset: [0, 6]`, `blur: 0`).
  * Khusus 3 kartu sorotan di Hero Section, kartu kiri & kanan diberi rotasi halus (`-2.5°` dan `+2.5°`) sementara kartu tengah lurus (`0°`) dan sedikit lebih depan.
* **Navigasi Atas:**
  * Kiri: Wordmark `simcat` (tebal geometris).
  * Tengah: `Home` | `Papan Peringkat` | `Aturan BKN`.
  * Kanan: Tombol pill outline `Masuk` (`border: 1.5px solid #181816`, `radius: 9999px`).
* **Target Sentuh & Reflow Mobile (`antislop-layoutmobile`):**
  * Semua tombol dan kartu aksi di mobile minimal tinggi `44px`, kartu Hero miring otomatis melurus (`0°`) dan menumpuk 1 kolom rapi di layar ponsel (`390px`), tanpa *horizontal overflow*.
