# [Nama Aplikasi] — Technical Specifications Document (TSD)

## 1. Stack Arsitektur & Teknologi
* **Frontend:** [React / Next.js / Flutter / Vue] dengan **Feature-Driven Architecture (FDA)**
* **Backend:** [Go / Node.js / NestJS / Python] dengan **Repository Pattern**
* **Database:** [PostgreSQL / SQLite / MySQL]
* **Design & Prototyping:** FigCraft Native

---

## 2. Struktur Modul Frontend (FDA)
```text
src/
└── features/
    ├── [fitur-utama-1]/
    │   ├── components/
    │   ├── hooks/
    │   ├── api/
    │   └── types/
    └── [fitur-utama-2]/
        ├── components/
        └── ...
```

---

## 3. Arsitektur Backend (Repository Pattern)
* **Layer 1 (Controller):** Menerima request HTTP, validasi skema payload, return standard JSON response.
* **Layer 2 (Service):** Logika bisnis utama, kalkulasi, transaksi ACID, otorisasi.
* **Layer 3 (Repository):** Akses data mentah ke database melalui query terindeks / ORM.

---

## 4. Skema Database & Entitas Inti
* **Tabel `users`:** `id`, `name`, `email`, `role`, `created_at`
* **Tabel `[entitas_1]`:** `id`, `name`, `status`, `created_at`
* **Tabel `[entitas_2]`:** `id`, `user_id`, `total_amount`, `created_at`

---

## 5. Batasan & Standar Koding Wajib
* **Zero RegEx:** Dilarang keras menggunakan Regular Expression dalam logika kode apa pun. Gunakan native string methods atau validator schema.
* **Pragmatisme Kode (Ponytail):** Jangan membuat lapisan abstraksi kosong tanpa kebutuhan nyata.
* **Keamanan (Security Audit):** Sanitasi input di Controller, otorisasi di Service, no hardcoded secrets.

