# Simulasi CAT CPNS (`simulasi-cat`) - Product Requirements Document (PRD)

## 1. Ringkasan Eksekutif & Tujuan Proyek

* **Nama Produk:** Simulasi CAT CPNS (`simulasi-cat`)
* **Visi Produk:** Menyediakan aplikasi web simulasi ujian Seleksi Kompetensi Dasar (SKD) dan Seleksi Kompetensi Bidang (SKB) CPNS berbasis Computer Assisted Test (CAT) yang menyerupai alur ujian BKN. Aplikasi ini hadir sebagai sarana latihan mandiri yang ringan, gratis, realistis, dan dapat langsung diakses tanpa hambatan pendaftaran awal.
* **Prinsip Utama:**
  * **Zero-Friction Access:** Pengguna dapat langsung mengerjakan tryout sebagai Guest tanpa wajib login.
  * **100% Free-Tier Infrastructure:** Arsitektur dioptimalkan agar berjalan penuh pada layanan gratis (Vercel dan Supabase Free Tier).
  * **Anti-Memorization:** Pengacakan urutan soal per subtes dan pengacakan posisi opsi jawaban (A sampai E) pada setiap sesi ujian baru.
* **Target Pengguna (User Persona):**
  * **Pelamar CPNS Mandiri (Guest):** Calon peserta CPNS yang ingin segera mencoba simulasi SKD/SKB dengan standar waktu dan ambang batas BKN tanpa membuat akun terlebih dahulu.
  * **Pelamar CPNS Terdaftar (Authenticated User):** Calon peserta CPNS yang rutin berlatih, ingin menyimpan riwayat skor tryout pribadi, serta membandingkan capaiannya pada papan peringkat (leaderboard).
  * **Admin Internal (Pengelola Bank Soal):** Pengelola konten internal yang menambahkan atau memperbarui paket ujian dan bank soal langsung melalui Supabase Dashboard atau SQL seed script pada tahap MVP v1.0.

---

## 2. Tech Stack & Batasan Infrastruktur

* **Frontend Framework:** Next.js (App Router) + TypeScript
* **Styling:** Tailwind CSS (tampilan bersih, kontras tinggi, fokus pada keterbacaan soal)
* **Backend & Database:** Supabase (PostgreSQL, Data API, Row Level Security)
* **Authentication:** Supabase Auth (Google OAuth dan Email)
* **Deployment:** Vercel
* **Batasan Teknis:**
  * Seluruh kalkulasi skor akhir untuk Guest Mode diproses di sisi client tanpa melakukan operasi `INSERT` ke database.
  * Koneksi database menggunakan region `ap-southeast-1` (Singapore) untuk latensi minimal dari Indonesia.

---

## 3. Peran Pengguna & Hak Akses (User Roles & Permissions)

| Role | Akses Halaman | Hak Akses Data |
| :--- | :--- | :--- |
| **Guest (Anonim)** | Landing Page, Katalog Tryout, Konfirmasi Ujian, Ruang Ujian CAT, Halaman Hasil & Pembahasan, Papan Skor (Read-Only) | `SELECT` pada tabel paket, `questions`, dan `scores`. Tidak dapat menyimpan skor ke database. |
| **Authenticated User** | Semua akses Guest + Riwayat Tryout Pribadi + Submit Skor ke Papan Peringkat | Semua akses Guest + `INSERT` skor milik sendiri ke tabel `scores` serta `SELECT`/`UPDATE` profil sendiri. |
| **Admin (Internal)** | Supabase Dashboard / SQL Editor (MVP v1.0) | Manajemen penuh bank soal (`questions`) dan paket ujian (`exam_packages`) langsung melalui database. |

---

## 4. Fitur Utama & Kebutuhan Bisnis (Prioritas MoSCoW)

### Must-Have (Wajib di MVP v1.0)
* **Katalog & Mode Ujian (FR-01):** Menyediakan paket Simulasi SKD Penuh (110 soal, 100 menit), Latihan Cepat per Subtes (TWK, TIU, atau TKP), dan Simulasi SKB.
* **Mesin Pengacakan Soal & Opsi Jawaban (FR-02):** Pengacakan berbasis Fisher-Yates Shuffle di dalam tiap blok subtes (TWK 1-30, TIU 31-65, TKP 66-110) serta pengacakan posisi opsi jawaban (A-E) dengan dukungan flag pengecualian `shuffle_options = false`.
* **Ruang Ujian CAT & Anti-Refresh Persistence (FR-03):** Timer mundur (`JJ:MM:DD`) dengan auto-submit, panel navigasi nomor soal berkode status warna, tombol aksi CAT standar, serta penyimpanan state sesi ke `localStorage`.
* **Penilaian Otomatis & Passing Grade BKN (FR-04):** Kalkulasi skor SKD berdasarkan KepmenPANRB No. 321 Tahun 2024 dan SKB (+5 benar, 0 salah/kosong), lengkap dengan aturan tie-breaker peringkat.
* **Halaman Evaluasi & Pembahasan (FR-05):** Ringkasan skor per subtes, status kelulusan ambang batas, perbandingan jawaban pengguna dengan kunci/poin tertinggi, dan teks pembahasan per soal.
* **Leaderboard & Guest-to-Auth Handoff (FR-06):** Papan peringkat per paket tryout untuk pengguna terdaftar serta pemindahan otomatis skor Guest dari `localStorage` ke database setelah login.

### Should-Have (Penting Setelah Alur Inti Stabil)
* **Riwayat Tryout Pribadi:** Daftar percobaan tryout yang pernah diselesaikan oleh Authenticated User beserta tren skor per subtes.
* **Filter & Pencarian Katalog:** Penyaringan paket berdasarkan jenis ujian (SKD Penuh, Mini Tryout TWK/TIU/TKP, SKB).

### Could-Have (Pengembangan Lanjutan)
* **Filter Pembahasan:** Menyaring daftar pembahasan soal berdasarkan status (Semua, Salah/Belum Maksimal, Kosong, Ragu-ragu).
* **Ringkasan Waktu Pengerjaan:** Menampilkan total durasi pengerjaan yang dipakai pengguna pada halaman hasil dan riwayat.

### Won't-Have / Out of Scope (v1.0 MVP)
* Halaman CMS atau Admin Dashboard berbasis UI di dalam aplikasi (input soal tahap awal dilakukan melalui SQL seed script).
* Sistem pembayaran atau langganan berbayar (payment gateway).
* Fitur diskusi atau komentar antar pengguna pada tiap butir soal.
* Mode ujian khusus disabilitas netra (durasi 130 menit).

---

## 5. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### FR-01: Katalog & Mode Ujian
Aplikasi menyediakan pilihan paket dan mode latihan berikut:
1. **Simulasi SKD Penuh:** 110 soal dengan durasi 100 menit mengikuti standar CAT BKN.
2. **Latihan Cepat (Mini Tryout per Subtes):** Latihan terfokus untuk TWK, TIU, atau TKP saja dengan jumlah soal dan durasi yang disesuaikan pada konfigurasi paket.
3. **Simulasi SKB:** Paket latihan berbasis bidang jabatan dengan struktur jumlah soal fleksibel dan sistem penilaian benar `+5`, salah/kosong `0`.

**Kriteria Penerimaan:**
* Setiap kartu paket menampilkan judul paket, jenis mode (SKD Penuh / Subtes / SKB), jumlah soal, dan durasi waktu.
* Jika pengguna masih memiliki sesi aktif di `localStorage` untuk suatu paket, katalog menampilkan opsi untuk melanjutkan sesi tersebut atau memulai sesi baru.

### FR-02: Mesin Pengacakan Soal & Pilihan Ganda (Randomization Engine)
1. **Pengacakan Soal Per Blok Subtes:**
   * Untuk SKD Penuh, urutan blok subtes wajib berurutan: **TWK (No. 1-30) -> TIU (No. 31-65) -> TKP (No. 66-110)**.
   * Pengacakan menggunakan algoritma **Fisher-Yates Shuffle** dilakukan secara terpisah di dalam masing-masing array subtes sebelum digabungkan (concatenate).
2. **Pengacakan Opsi Jawaban (A-E):**
   * Setiap opsi jawaban menyimpan bobot nilainya masing-masing (`score`) di dalam struktur `JSONB` tanpa menyimpan huruf `A`-`E` secara statis di database.
   * Saat soal dimuat ke sesi ujian, array opsi diacak menggunakan Fisher-Yates Shuffle dan label `A`-`E` di-render dinamis berdasarkan indeks array (`0 = A`, `1 = B`, dst.).
   * **Pengecualian:** Jika soal memiliki flag `shuffle_options = false` (misalnya soal dengan opsi "Semua jawaban benar"), urutan opsi dipertahankan sesuai urutan asli.

**Kriteria Penerimaan:**
* Dua sesi baru yang dimulai pada paket SKD Penuh yang sama menghasilkan urutan soal dan urutan opsi yang berbeda, namun blok nomor 1-30 selalu berisi soal TWK, 31-65 berisi TIU, dan 66-110 berisi TKP.
* Soal dengan `shuffle_options = false` selalu menampilkan opsi pada posisi tetap.

### FR-03: Antarmuka Ruang Ujian CAT & Persistensi Sesi
1. **Timer Mundur:** Menampilkan sisa waktu (`JJ:MM:DD`) secara real-time. Ketika sisa waktu menyentuh `00:00:00`, ujian otomatis selesai (auto-submit).
2. **Panel Navigasi Soal:** Menampilkan kotak nomor soal (1 sampai N, misal 1-110) dengan indikator warna:
   * **Abu-abu / Putih:** Belum dijawab.
   * **Hijau:** Sudah dijawab.
   * **Kuning / Oranye:** Ditandai Ragu-ragu.
3. **Kontrol Navigasi:** Tombol **Simpan & Lanjutkan**, **Lewati**, **Tandai Ragu-ragu**, klik langsung pada nomor soal di matriks, dan tombol **Selesai Ujian** (dilengkapi modal konfirmasi yang menampilkan jumlah soal terjawab, ragu-ragu, dan belum dijawab).
4. **Anti-Refresh State Persistence:**
   * Saat sesi dimulai, snapshot urutan soal hasil acakan, urutan opsi hasil acakan, jawaban pengguna, status ragu-ragu, dan waktu selesai (`end_timestamp`) disimpan ke `localStorage`.
   * Jika halaman di-refresh atau tab ditutup lalu dibuka kembali sebelum waktu habis, sesi dilanjutkan dari state terakhir tanpa mengacak ulang soal maupun mereset timer.

**Kriteria Penerimaan:**
* Refresh browser di tengah ujian tidak mengubah urutan soal, urutan opsi, jawaban yang sudah dipilih, maupun sisa waktu.
* Saat `Date.now() >= end_timestamp` (termasuk jika tab sempat tertutup melewati batas waktu), sesi langsung diproses sebagai selesai.

### FR-04: Logika Penilaian & Passing Grade (SKD & SKB)
Sistem menghitung skor otomatis setelah ujian berakhir berdasarkan acuan CAT BKN (KepmenPANRB No. 321 Tahun 2024):

| Subtes | Jumlah Soal | Bobot Penilaian | Skor Maksimal | Ambang Batas (Passing Grade) |
| :--- | :---: | :--- | :---: | :---: |
| **TWK** (Tes Wawasan Kebangsaan) | 30 | Benar: `+5`, Salah/Kosong: `0` | 150 | **65** |
| **TIU** (Tes Intelegensia Umum) | 35 | Benar: `+5`, Salah/Kosong: `0` | 175 | **80** |
| **TKP** (Tes Karakteristik Pribadi) | 45 | Skala opsi: `1` s.d. `5`, Kosong: `0` | 225 | **166** |
| **TOTAL SKD** | **110** | - | **550** | **311** |

* **Status Kelulusan SKD Penuh:** Pengguna dinyatakan **Lulus Passing Grade** hanya jika ketiga subtes memenuhi nilai ambang batas masing-masing (`TWK >= 65` AND `TIU >= 80` AND `TKP >= 166`).
* **Penilaian Mini Tryout Subtes:** Menghitung skor subtes yang dikerjakan dan menampilkan status terhadap ambang batas proporsional atau ambang batas paket yang didefinisikan pada data paket.
* **Penilaian SKB:** Benar `+5`, salah atau kosong `0`. Tidak menggunakan aturan passing grade SKD.
* **Aturan Tie-Breaker Papan Skor:** Jika terdapat total skor yang sama pada papan peringkat, urutan peringkat ditentukan berdasarkan nilai tertinggi secara berurutan dari: **Total Skor -> Skor TKP -> Skor TIU -> Skor TWK -> Waktu Submit Tercepat**.

### FR-05: Halaman Evaluasi & Pembahasan
Setelah ujian selesai, pengguna diarahkan ke halaman ringkasan hasil yang menampilkan:
* Rincian skor per subtes (TWK, TIU, TKP, dan Total untuk SKD; atau skor total untuk SKB/Mini Tryout) beserta status lulus atau tidak lulus passing grade.
* Daftar seluruh soal yang dikerjakan lengkap dengan: opsi yang dipilih pengguna, kunci jawaban atau opsi dengan poin tertinggi, perolehan poin per butir soal, dan teks pembahasan detail.

### FR-06: Papan Peringkat (Leaderboard) & Guest-to-Auth Handoff
1. **Papan Peringkat:** Menampilkan daftar peringkat pengguna yang sudah login berdasarkan paket tryout. Kolom tabel memuat: Peringkat, Nama Pengguna, Skor TWK, Skor TIU, Skor TKP, Total Skor, dan Status Passing Grade (untuk SKD).
2. **Alur Guest-to-Auth Handoff:**
   * Jika Guest menyelesaikan ujian, hasil sementara dan payload jawaban disimpan di `localStorage`, lalu halaman hasil menampilkan CTA: **"Login untuk Simpan Skor ke Papan Peringkat"**.
   * Setelah Guest berhasil login (Google OAuth atau Email), sistem otomatis membaca data sementara dari `localStorage`, mengirimkannya untuk divalidasi dan disimpan ke tabel `scores` di Supabase, lalu menghapus data sementara tersebut agar tidak terjadi duplikasi.

---

## 6. Alur Pengguna (User Journey & Flow)

### Alur Utama (Guest & Authenticated)
1. **Landing Page & Katalog:** Pengguna membuka aplikasi dan memilih paket ujian (SKD Penuh, Latihan Cepat Subtes, atau SKB).
2. **Halaman Konfirmasi Ujian:** Sistem menampilkan ringkasan aturan paket (jumlah soal, durasi, bobot nilai, dan passing grade). Pengguna menekan tombol **Mulai Ujian**.
3. **Ruang Ujian CAT:** Sistem mengambil seluruh soal paket dalam satu kali request, menjalankan Fisher-Yates Shuffle, menyimpan snapshot sesi ke `localStorage`, dan memulai hitung mundur. Pengguna mengerjakan soal lalu menekan **Selesai Ujian** (atau waktu habis).
4. **Halaman Hasil & Pembahasan:**
   * **Jika Authenticated User:** Jawaban dikirim ke server untuk verifikasi skor dan penyimpanan otomatis ke tabel `scores`, lalu hasil, pembahasan, dan posisi di Leaderboard ditampilkan.
   * **Jika Guest:** Skor dihitung di client tanpa `INSERT` ke database. Hasil dan pembahasan tampil langsung bersama CTA login untuk menyimpan skor ke Leaderboard.

### Alur Guest-to-Auth Handoff
1. Guest menekan **"Login untuk Simpan Skor ke Papan Peringkat"** pada halaman hasil.
2. Pengguna menyelesaikan autentikasi melalui Supabase Auth (Google OAuth atau Email).
3. Saat kembali ke aplikasi, handler auth mendeteksi pending result di `localStorage`, memanggil endpoint penyimpanan skor, menampilkan notifikasi bahwa skor berhasil disimpan ke Leaderboard, dan membersihkan key pending di `localStorage`.

---

## 7. Kebutuhan Antarmuka & Layar (UI Screens)

Seluruh layar dirancang mengikuti standar keterbacaan ujian CAT dan prinsip desain bersih (tanpa dekorasi berlebihan, tanpa emoji di tombol/heading, dan kontras teks minimal 4.5:1):

1. **Landing Page & Katalog Tryout - (Desktop 1440x900) & (Mobile 390x844):**
   * Header navigasi sederhana berisi identitas brand, tautan Katalog, Papan Peringkat, dan tombol Masuk (atau menu akun jika sudah login).
   * Daftar paket tryout dikelompokkan berdasarkan mode (SKD Penuh, Latihan Cepat Subtes, SKB) dengan informasi jumlah soal, durasi, dan tombol aksi spesifik ("Lihat Aturan & Mulai").
   * Pada layar tablet dan mobile, grid kartu paket reflow dari 3 kolom menjadi 2 kolom lalu 1 kolom penuh tanpa horizontal overflow.
2. **Halaman Konfirmasi Ujian - (Desktop 1440x900) & (Mobile 390x844):**
   * Kartu terpusat berisi detail paket, tabel ringkas jumlah soal dan ambang batas (passing grade), informasi bahwa soal dan opsi akan diacak, serta tombol utama **Mulai Ujian**.
3. **Ruang Ujian CAT - (Desktop 1440x900):**
   * Top bar ringkas (sticky) menampilkan nama paket, label subtes aktif (TWK/TIU/TKP), timer mundur (`JJ:MM:DD`) berangka tabular, dan tombol **Selesai Ujian**.
   * Layout 2 kolom: Area soal dan opsi A-E di kolom kiri (lebar dominan, tipografi nyaman dibaca untuk teks panjang) dengan bar aksi bawah (**Lewati**, **Tandai Ragu-ragu**, **Simpan & Lanjutkan**); panel matriks nomor soal (1-110) di kolom kanan beserta legenda warna status.
4. **Ruang Ujian CAT - (Mobile 390x844):**
   * Header ringkas menampilkan nomor soal aktif, timer mundur, tombol pembuka drawer **Daftar Soal**, dan tombol **Selesai**.
   * Area soal dan opsi A-E menggunakan ukuran target sentuh minimal 44x44 px dengan jarak antar opsi yang cukup agar tidak salah tekan.
   * Matriks nomor soal dibuka melalui bottom sheet/drawer agar area baca soal tetap lega; bar tombol aksi berada di bawah dengan safe-area padding.
5. **Halaman Hasil & Pembahasan - (Desktop 1440x900) & (Mobile 390x844):**
   * Ringkasan status kelulusan passing grade dan kartu skor per subtes di bagian atas.
   * Banner CTA khusus Guest ("Login untuk Simpan Skor ke Papan Peringkat") yang tidak muncul jika pengguna sudah login.
   * Daftar soal dan pembahasan di bagian bawah dengan penandaan jelas antara pilihan pengguna, kunci/poin tertinggi, dan penjelasan.
6. **Halaman Papan Peringkat - (Desktop 1440x900) & (Mobile 390x844):**
   * Pemilih paket tryout di bagian atas, diikuti tabel peringkat (Peringkat, Nama, TWK, TIU, TKP, Total, Status Passing Grade).
   * Menyediakan empty state informatif ("Belum ada skor tercatat untuk paket ini. Mulai tryout untuk menjadi yang pertama.") serta loading dan error state yang jelas.

---

## 8. Non-Functional Requirements (NFR)

* **Performa & Latensi:**
  * Pengambilan seluruh soal dalam satu paket dilakukan dalam **satu kali request** di awal sesi ujian agar perpindahan antar nomor soal di dalam ruang ujian berjalan instan (`0ms` latensi jaringan).
  * Region database menggunakan `ap-southeast-1` (Singapore).
* **Keamanan Data (RLS & Integritas Skor):**
  * Tabel `exam_packages` dan `questions` hanya mengizinkan operasi `SELECT` untuk publik (`anon` dan `authenticated`).
  * Tabel `scores` mengizinkan `SELECT` untuk publik, sedangkan `INSERT` hanya diizinkan untuk `authenticated` dengan validasi `auth.uid() = user_id`.
  * Skor yang disimpan ke papan peringkat wajib dihitung ulang di sisi server dari jawaban pengguna untuk mencegah pemalsuan skor dari client.
* **Responsivitas & Ergonomi:**
  * Mendukung reflow 3 tahap (mobile, tablet/small laptop, desktop) tanpa horizontal scroll leak.
  * Target sentuh interaktif pada mobile minimal `44 x 44 px` dengan jarak antar tombol yang jelas.
* **Reliabilitas Sesi:**
  * State ujian di `localStorage` tahan terhadap refresh halaman dan perpindahan tab sementara tanpa mengacak ulang soal atau mereset timer.
* **Aksesibilitas:**
  * Navigasi ruang ujian dan pilihan jawaban dapat dioperasikan melalui keyboard (Tab, Arrow keys, Enter/Space) serta memenuhi rasio kontras teks minimal `4.5:1`.
