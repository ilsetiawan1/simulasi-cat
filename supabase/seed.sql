-- Simulasi CAT CPNS (simulasi-cat)
-- Idempotent Seed Data: Exam Packages & Starter Questions

-- 1. Exam Packages (5 paket aktif: SKD Full, 3 Mini Tryout Subtes, 1 SKB)
insert into public.exam_packages (
  id, slug, title, description, category, duration_minutes, total_questions,
  passing_grade_twk, passing_grade_tiu, passing_grade_tkp, is_active
)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'skd-penuh-01',
    'Simulasi SKD Penuh - Paket 01',
    'Simulasi lengkap standar CAT BKN dengan urutan blok TWK, TIU, dan TKP serta evaluasi passing grade KepmenPANRB No. 321 Tahun 2024.',
    'SKD_FULL',
    100,
    110,
    65,
    80,
    166,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'mini-twk-01',
    'Latihan Cepat TWK - Paket 01',
    'Latihan terfokus Tes Wawasan Kebangsaan meliputi Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.',
    'MINI_TWK',
    25,
    30,
    65,
    null,
    null,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'mini-tiu-01',
    'Latihan Cepat TIU - Paket 01',
    'Latihan terfokus Tes Intelegensia Umum meliputi kemampuan verbal, numerik, dan figural/logika.',
    'MINI_TIU',
    30,
    35,
    null,
    80,
    null,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'mini-tkp-01',
    'Latihan Cepat TKP - Paket 01',
    'Latihan terfokus Tes Karakteristik Pribadi skala penilaian 1 s.d. 5 untuk pelayanan publik, jejaring kerja, dan profesionalisme.',
    'MINI_TKP',
    35,
    45,
    null,
    null,
    166,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'skb-pranata-komputer-01',
    'Simulasi SKB Pranata Komputer - Paket 01',
    'Latihan Seleksi Kompetensi Bidang jabatan Pranata Komputer (basis data, jaringan, keamanan informasi, dan rekayasa perangkat lunak).',
    'SKB',
    90,
    100,
    null,
    null,
    null,
    true
  )
on conflict (slug) do nothing;

-- 2. Sample Questions — SKD Penuh Paket 01 (TWK, TIU, TKP)
insert into public.questions (
  id, package_id, subtest, question_text, options, shuffle_options, explanation
)
values
  -- TWK (Benar +5, Salah 0)
  (
    '22222222-2222-4222-8222-222222222101',
    '11111111-1111-4111-8111-111111111101',
    'TWK',
    'Dalam sistem ketatanegaraan Indonesia setelah amandemen UUD 1945, apabila terjadi sengketa kewenangan antarlembaga negara yang kewenangannya diberikan oleh UUD 1945, mekanisme penyelesaian sesuai Pasal 24C ayat (1) adalah...',
    '[
      {"id": "opt_1", "text": "Diputus pada tingkat pertama dan terakhir oleh Mahkamah Konstitusi yang putusannya bersifat final.", "score": 5},
      {"id": "opt_2", "text": "Diselesaikan melalui rapat paripurna DPR bersama Presiden dengan pertimbangan Mahkamah Agung.", "score": 0},
      {"id": "opt_3", "text": "Diajukan melalui kasasi ke Mahkamah Agung setelah melalui proses mediasi oleh MPR.", "score": 0},
      {"id": "opt_4", "text": "Diputuskan oleh Komisi Yudisial sebagai pengawas kehormatan lembaga peradilan nasional.", "score": 0},
      {"id": "opt_5", "text": "Ditetapkan oleh Presiden melalui Peraturan Pemerintah Pengganti Undang-Undang.", "score": 0}
    ]'::jsonb,
    true,
    'Berdasarkan Pasal 24C ayat (1) UUD 1945, Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD 1945.'
  ),
  (
    '22222222-2222-4222-8222-222222222102',
    '11111111-1111-4111-8111-111111111101',
    'TWK',
    'Asas penyelenggaraan pemerintahan yang mengutamakan keseimbangan antara hak dan kewajiban penyelenggara negara sebagaimana diatur dalam UU No. 28 Tahun 1999 disebut asas...',
    '[
      {"id": "opt_1", "text": "Asas Proporsionalitas", "score": 5},
      {"id": "opt_2", "text": "Asas Akuntabilitas", "score": 0},
      {"id": "opt_3", "text": "Asas Kepastian Hukum", "score": 0},
      {"id": "opt_4", "text": "Asas Keterbukaan", "score": 0},
      {"id": "opt_5", "text": "Asas Tertib Penyelenggaraan Negara", "score": 0}
    ]'::jsonb,
    true,
    'Sesuai UU No. 28 Tahun 1999, Asas Proporsionalitas adalah asas yang mengutamakan keseimbangan antara hak dan kewajiban penyelenggara negara.'
  ),
  (
    '22222222-2222-4222-8222-222222222103',
    '11111111-1111-4111-8111-111111111101',
    'TWK',
    'Manakah dari pernyataan berikut yang termasuk nilai dasar Bela Negara menurut UU No. 23 Tahun 2019?',
    '[
      {"id": "opt_1", "text": "Cinta tanah air dan kesadaran berbangsa dan bernegara", "score": 0},
      {"id": "opt_2", "text": "Setia pada Pancasila sebagai ideologi negara", "score": 0},
      {"id": "opt_3", "text": "Rela berkorban untuk bangsa dan negara", "score": 0},
      {"id": "opt_4", "text": "Kemampuan awal bela negara", "score": 0},
      {"id": "opt_5", "text": "Semua jawaban di atas benar", "score": 5}
    ]'::jsonb,
    false,
    'Pasal 7 ayat (3) UU No. 23 Tahun 2019 menetapkan kelima nilai dasar Bela Negara: cinta tanah air, sadar berbangsa dan bernegara, setia pada Pancasila, rela berkorban, serta kemampuan awal bela negara.'
  ),

  -- TIU (Benar +5, Salah 0)
  (
    '22222222-2222-4222-8222-222222222104',
    '11111111-1111-4111-8111-111111111101',
    'TIU',
    'Jika 3x + 7 = 28 dan 2y - 4 = 10, maka nilai dari x + 2y adalah...',
    '[
      {"id": "opt_1", "text": "21", "score": 5},
      {"id": "opt_2", "text": "14", "score": 0},
      {"id": "opt_3", "text": "18", "score": 0},
      {"id": "opt_4", "text": "24", "score": 0},
      {"id": "opt_5", "text": "28", "score": 0}
    ]'::jsonb,
    true,
    'Dari 3x + 7 = 28 diperoleh 3x = 21 sehingga x = 7. Dari 2y - 4 = 10 diperoleh 2y = 14 sehingga y = 7. Maka x + 2y = 7 + 14 = 21.'
  ),
  (
    '22222222-2222-4222-8222-222222222105',
    '11111111-1111-4111-8111-111111111101',
    'TIU',
    'Lanjutkan deret angka berikut: 4, 9, 19, 39, 79, ...',
    '[
      {"id": "opt_1", "text": "159", "score": 5},
      {"id": "opt_2", "text": "149", "score": 0},
      {"id": "opt_3", "text": "158", "score": 0},
      {"id": "opt_4", "text": "160", "score": 0},
      {"id": "opt_5", "text": "169", "score": 0}
    ]'::jsonb,
    true,
    'Pola deret adalah (suku sebelumnya x 2) + 1: 4x2+1=9, 9x2+1=19, 19x2+1=39, 39x2+1=79, maka berikutnya 79x2+1 = 159.'
  ),
  (
    '22222222-2222-4222-8222-222222222106',
    '11111111-1111-4111-8111-111111111101',
    'TIU',
    'Semua ASN wajib mematuhi kode etik. Sebagian peserta pelatihan adalah ASN. Kesimpulan yang paling tepat adalah...',
    '[
      {"id": "opt_1", "text": "Sebagian peserta pelatihan wajib mematuhi kode etik.", "score": 5},
      {"id": "opt_2", "text": "Semua peserta pelatihan adalah ASN.", "score": 0},
      {"id": "opt_3", "text": "Semua peserta pelatihan wajib mematuhi kode etik.", "score": 0},
      {"id": "opt_4", "text": "Sebagian ASN tidak wajib mematuhi kode etik.", "score": 0},
      {"id": "opt_5", "text": "Tidak ada peserta pelatihan yang mematuhi kode etik.", "score": 0}
    ]'::jsonb,
    true,
    'Berdasarkan silogisme kategoris: karena sebagian peserta pelatihan adalah ASN dan seluruh ASN wajib mematuhi kode etik, maka sebagian peserta pelatihan wajib mematuhi kode etik.'
  ),

  -- TKP (Skala 1 s.d. 5, Kosong 0)
  (
    '22222222-2222-4222-8222-222222222107',
    '11111111-1111-4111-8111-111111111101',
    'TKP',
    'Saat jam pelayanan loket hampir selesai, datang seorang warga lanjut usia dari daerah jauh yang membutuhkan legalisasi dokumen mendesak, namun berkas fotokopinya kurang satu lembar. Sikap Anda adalah...',
    '[
      {"id": "opt_1", "text": "Membantu mengarahkan fotokopi terdekat dan tetap menyelesaikan layanan berkasnya dengan ramah sesuai prosedur.", "score": 5},
      {"id": "opt_2", "text": "Menerima berkas yang ada terlebih dahulu lalu meminta warga tersebut melengkapi kekurangannya segera sebelum loket ditutup.", "score": 4},
      {"id": "opt_3", "text": "Menjelaskan kekurangan berkas dengan sopan dan memintanya datang kembali esok hari saat loket dibuka.", "score": 3},
      {"id": "opt_4", "text": "Meminta rekan kerja lain untuk menanganinya karena jam kerja Anda hampir habis.", "score": 2},
      {"id": "opt_5", "text": "Menolak langsung karena waktu pelayanan tinggal beberapa menit lagi.", "score": 1}
    ]'::jsonb,
    true,
    'Aspek Pelayanan Publik: poin tertinggi (5) diberikan pada sikap solutif, empatik, dan tetap patuh pada prosedur layanan tanpa menunda kebutuhan mendesak warga.'
  ),
  (
    '22222222-2222-4222-8222-222222222108',
    '11111111-1111-4111-8111-111111111101',
    'TKP',
    'Instansi Anda baru saja menerapkan sistem persuratan digital baru, tetapi beberapa rekan senior mengalami kesulitan menggunakannya sehingga proses disposisi melambat. Tindakan Anda adalah...',
    '[
      {"id": "opt_1", "text": "Membuat panduan ringkas langkah demi langkah dan meluangkan waktu mendampingi rekan senior hingga terbiasa.", "score": 5},
      {"id": "opt_2", "text": "Membantu mengoperasikan sistem setiap kali rekan senior meminta bantuan.", "score": 4},
      {"id": "opt_3", "text": "Mengusulkan kepada atasan agar diadakan pelatihan ulang untuk seluruh pegawai.", "score": 3},
      {"id": "opt_4", "text": "Fokus menyelesaikan pekerjaan sendiri terlebih dahulu agar target pribadi tidak terganggu.", "score": 2},
      {"id": "opt_5", "text": "Membiarkannya karena adaptasi teknologi adalah tanggung jawab masing-masing pegawai.", "score": 1}
    ]'::jsonb,
    true,
    'Aspek TIK & Jejaring Kerja: poin tertinggi (5) menunjukkan inisiatif berbagi pengetahuan secara terstruktur dan kolaboratif agar seluruh tim mampu beradaptasi.'
  ),
  (
    '22222222-2222-4222-8222-222222222109',
    '11111111-1111-4111-8111-111111111101',
    'TKP',
    'Anda ditugaskan memimpin rapat lintas bidang yang diwarnai perbedaan pendapat tajam mengenai pembagian anggaran kegiatan. Langkah yang Anda ambil adalah...',
    '[
      {"id": "opt_1", "text": "Memfasilitasi setiap bidang memaparkan prioritas berbasis data lalu menyepakati alokasi paling berdampak bagi target instansi.", "score": 5},
      {"id": "opt_2", "text": "Mencatat seluruh usulan dari tiap bidang dan membawa rekomendasinya kepada pimpinan untuk diputuskan.", "score": 4},
      {"id": "opt_3", "text": "Membagi anggaran secara merata kepada semua bidang agar tidak terjadi konflik berkepanjangan.", "score": 3},
      {"id": "opt_4", "text": "Menunda rapat hingga suasana lebih tenang pada minggu berikutnya.", "score": 2},
      {"id": "opt_5", "text": "Memutuskan sepihak sesuai bidang yang paling Anda kuasai agar rapat cepat selesai.", "score": 1}
    ]'::jsonb,
    true,
    'Aspek Profesionalisme & Jejaring Kerja: poin tertinggi (5) mengutamakan musyawarah objektif berbasis data dan kepentingan organisasi.'
  ),

  -- Mini Tryout TWK starter
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111102',
    'TWK',
    'Pokok pikiran pertama dalam Pembukaan UUD 1945 yang menyatakan negara melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia merupakan penjabaran dari sila ke...',
    '[
      {"id": "opt_1", "text": "Sila ketiga (Persatuan Indonesia)", "score": 5},
      {"id": "opt_2", "text": "Sila pertama (Ketuhanan Yang Maha Esa)", "score": 0},
      {"id": "opt_3", "text": "Sila kedua (Kemanusiaan yang Adil dan Beradab)", "score": 0},
      {"id": "opt_4", "text": "Sila keempat (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan)", "score": 0},
      {"id": "opt_5", "text": "Sila kelima (Keadilan Sosial bagi Seluruh Rakyat Indonesia)", "score": 0}
    ]'::jsonb,
    true,
    'Pokok pikiran pertama Pembukaan UUD 1945 adalah pokok pikiran persatuan, yang merupakan penjabaran sila ketiga Pancasila.'
  ),

  -- Mini Tryout TIU starter
  (
    '22222222-2222-4222-8222-222222222301',
    '11111111-1111-4111-8111-111111111103',
    'TIU',
    'Sebuah proyek dapat diselesaikan oleh 12 pekerja dalam 20 hari. Jika jumlah pekerja ditambah menjadi 15 orang dengan kecepatan kerja sama, berapa hari proyek tersebut selesai?',
    '[
      {"id": "opt_1", "text": "16 hari", "score": 5},
      {"id": "opt_2", "text": "15 hari", "score": 0},
      {"id": "opt_3", "text": "18 hari", "score": 0},
      {"id": "opt_4", "text": "24 hari", "score": 0},
      {"id": "opt_5", "text": "25 hari", "score": 0}
    ]'::jsonb,
    true,
    'Perbandingan berbalik nilai: 12 x 20 = 15 x t -> 240 = 15t -> t = 16 hari.'
  ),

  -- Mini Tryout TKP starter
  (
    '22222222-2222-4222-8222-222222222401',
    '11111111-1111-4111-8111-111111111104',
    'TKP',
    'Anda menemukan kesalahan input data pada laporan bulanan yang sudah telanjur dikirim ke pimpinan satu jam lalu. Sikap Anda adalah...',
    '[
      {"id": "opt_1", "text": "Segera mengakui kekeliruan, menyiapkan revisi yang akurat, dan mengirimkan pembaruan beserta penjelasan singkat kepada pimpinan.", "score": 5},
      {"id": "opt_2", "text": "Memperbaiki data terlebih dahulu lalu melaporkannya saat rapat evaluasi minggu depan.", "score": 4},
      {"id": "opt_3", "text": "Meminta saran rekan satu tim apakah kesalahan tersebut perlu dilaporkan atau tidak.", "score": 3},
      {"id": "opt_4", "text": "Menunggu apakah pimpinan menyadari kesalahan tersebut sebelum memperbaikinya.", "score": 2},
      {"id": "opt_5", "text": "Mengabaikannya karena selisih angkanya dianggap tidak terlalu besar.", "score": 1}
    ]'::jsonb,
    true,
    'Aspek Integritas & Profesionalisme: poin tertinggi (5) diberikan pada keberanian bertanggung jawab dan bertindak cepat mengoreksi kesalahan.'
  ),

  -- SKB Pranata Komputer starter (Benar +5, Salah 0)
  (
    '22222222-2222-4222-8222-222222222501',
    '11111111-1111-4111-8111-111111111105',
    'SKB',
    'Pada PostgreSQL, fitur yang memungkinkan pembatasan akses baris tabel secara langsung berdasarkan identitas pengguna (misalnya auth.uid()) disebut...',
    '[
      {"id": "opt_1", "text": "Row Level Security (RLS)", "score": 5},
      {"id": "opt_2", "text": "Foreign Data Wrapper (FDW)", "score": 0},
      {"id": "opt_3", "text": "Write-Ahead Logging (WAL)", "score": 0},
      {"id": "opt_4", "text": "Multiversion Concurrency Control (MVCC)", "score": 0},
      {"id": "opt_5", "text": "Common Table Expression (CTE)", "score": 0}
    ]'::jsonb,
    true,
    'Row Level Security (RLS) pada PostgreSQL membatasi baris mana yang dapat dibaca atau dimodifikasi oleh peran/pengguna tertentu melalui policy.'
  ),
  (
    '22222222-2222-4222-8222-222222222502',
    '11111111-1111-4111-8111-111111111105',
    'SKB',
    'Indeks komposit (package_id, total_score DESC, score_tkp DESC) paling efektif digunakan untuk mempercepat query yang melakukan...',
    '[
      {"id": "opt_1", "text": "Filter berdasarkan package_id dan pengurutan leaderboard berdasarkan total_score lalu score_tkp.", "score": 5},
      {"id": "opt_2", "text": "Pencarian teks bebas (full-text search) pada kolom penjelasan soal.", "score": 0},
      {"id": "opt_3", "text": "Filter hanya berdasarkan score_tkp tanpa menyertakan package_id dan total_score.", "score": 0},
      {"id": "opt_4", "text": "Penghapusan seluruh baris tabel secara permanen menggunakan TRUNCATE.", "score": 0},
      {"id": "opt_5", "text": "Enkripsi kolom kata sandi sebelum disimpan ke disk.", "score": 0}
    ]'::jsonb,
    true,
    'Indeks B-Tree komposit mengikuti aturan leftmost prefix dan urutan sort yang cocok untuk filter package_id diikuti ORDER BY total_score DESC, score_tkp DESC.'
  )
on conflict (id) do nothing;
