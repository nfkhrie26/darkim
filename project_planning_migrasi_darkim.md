# Project Planning: Migrasi & Refactoring Sistem DARKIM

**Arsitektur Monorepo: Next.js Full-Stack (PostgreSQL + Tailwind CSS) + Python FastAPI (Vision Engine)**

---

## 1. Konteks & Latar Belakang Perbaikan

**DARKIM** adalah sistem pendukung keputusan gizi berbasis *Computer Vision* dan *Deep Learning* (YOLOv8n + Morfologi Sobel 2-Arah + EasyOCR) untuk memindai barcode kemasan pangan dan mengevaluasi keamanan konsumsinya.

### Tujuan Refactoring dari Proyek Laravel Lama
1. **Fokus Utama pada UX Pemindaian & Filter Kondisi Kesehatan:** Memberikan pengalaman pengguna yang responsif saat mengakses kamera (*WebRTC*), mengunggah foto kemasan, serta berpindah antara dua profil kondisi kesehatan (**Hipertensi** atau **Diabetes Melitus**) secara instan tanpa *reload* halaman.
2. **Pemisahan Tugas (*Separation of Concerns*):**
   * **Python (FastAPI):** Bertindak murni sebagai *stateless extraction engine* untuk mendeteksi dan membaca digit barcode (EAN-13 / UPC-A) yang lolos validasi *Checksum* GS1.
   * **Next.js (App Router):** Menangani seluruh *frontend* (identik dengan layout Blade lama), manajemen database **PostgreSQL**, integrasi API **OpenFoodFacts**, sistem tiket laporan produk kosong, dashboard admin, serta kalkulasi evaluasi gizi.

---

## 2. Arsitektur Sistem Baru

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser HP / Laptop)                     │
│  - Pilih Profil Kesehatan: [ Hipertensi | Diabetes Melitus ]            │
│  - WebRTC Live Camera / Upload Foto Kemasan                             │
│  - Modal Report Textbox / Upload Foto Kemasan Depan & Tabel Gizi        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTP POST (Multipart FormData / JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               NEXT.JS FULL-STACK (apps/web — PostgreSQL)                │
│                                                                         │
│  [1. View / UI Layer (Tailwind)] ◄──► [2. Service / API Client Layer]   │
│    (Layout 1:1 dari Blade lama)               │                         │
│                               ┌───────────────┼───────────────┐         │
│                               ▼               ▼               ▼         │
│                       1. Hit ML API    2. Cek & Insert  3. Fetch OFF    │
│                       (Get Barcode)     PostgreSQL DB    (Background)   │
│                                               │                         │
└───────────────────────────────────────────────┼─────────────────────────┘
                                                │ Internal HTTP Request
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                PYTHON ML SERVICE (services/ml-engine)                   │
│  - FastAPI (/api/v1/extract-barcode)                                    │
│  - YOLOv8n (best.pt) + Morfologi Sobel 2-Arah + Multi-Angle Rotation    │
│  - Pyzbar / OpenCV Decoder + Progressive Cubic Upscaling + EasyOCR      │
│  - Output: JSON { success, barcode, boxes, confidence, stage, time_ms } │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Alur Website Baru (User Flows)

### A. Alur Guest User (Tanpa Login)
Pengguna umum tidak perlu login untuk melakukan pemindaian dan melihat rekomendasi gizi.

1. **Pemilihan Profil Kesehatan & Input Citra (`/`):**
   * User memilih salah satu dari **2 profil kesehatan**: **Hipertensi** atau **Diabetes Melitus**.
   * User memindai barcode kemasan via **Kamera Langsung (WebRTC)** atau **Upload Foto** dari perangkat.
2. **Ekstraksi Barcode via Python ML Engine:**
   * Next.js mengirimkan gambar ke FastAPI (`/api/v1/extract-barcode`).
   * Jika barcode gagal terbaca, UI menampilkan pesan agar user mengambil ulang foto dengan pencahayaan/fokus lebih jelas.
3. **Pencocokan Data Nutrisi (Database Lokal $\rightarrow$ OpenFoodFacts):**
   * **Langkah 1 (Cek DB Lokal):** Next.js mencari `barcode` di tabel `products` pada **PostgreSQL**. Jika ditemukan, data langsung dikembalikan ke UI.
   * **Langkah 2 (Auto-Fetch OpenFoodFacts):** Jika tidak ada di PostgreSQL, Next.js otomatis melakukan *hit* ke API **OpenFoodFacts (OFF)** di *background*.
   * **Langkah 3 (Auto-Insert Cache):** Jika data ditemukan di OFF, sistem langsung menampilkannya ke user sekaligus melakukan `INSERT` otomatis ke tabel `products` di PostgreSQL agar pemindaian berikutnya instan.
4. **Skenario Data Kosong di Kedua Sumber (Fallback Crowdsourcing):**
   * Jika produk benar-benar tidak ditemukan baik di PostgreSQL maupun OpenFoodFacts, UI menampilkan modal/opsi kontribusi dengan **2 pilihan** (kode `barcode` otomatis terlampir di sistem):
     1. **Modal Report Textbox:** User cukup mengisi kolom teks singkat (misal: nama produk atau catatan keluhan) lalu klik kirim untuk membuat tiket laporan ke Admin.
     2. **Bantu Tambah Data (Upload 2 Foto):** User mengunggah **Foto Kemasan Depan** dan **Foto Tabel Nilai Gizi (Belakang)** untuk dikirim sebagai tiket kelengkapan data ke Admin.
5. **Tampilan Hasil & Evaluasi Gizi:**
   * Sistem mengevaluasi data gizi berdasarkan profil yang dipilih (**Hipertensi** atau **Diabetes Melitus**) menggunakan *dummy rules* sementara, lalu menampilkan status keamanan beserta rincian nutrisinya.

### B. Alur Admin (Terautentikasi)
Admin bertugas mengelola database produk lokal dan menindaklanjuti tiket laporan dari user.

1. **Login Admin (`/admin/login`):**
   * Autentikasi berbasis sesi untuk mengakses area `/admin/*`.
2. **Dashboard Tiket Laporan User (`/admin/tickets`):**
   * Admin melihat daftar tiket masuk yang berisi `barcode`, catatan laporan user, serta *preview* **foto kemasan depan** dan **foto tabel gizi belakang** (jika diunggah oleh user).
   * Admin mengeksekusi tiket yang masuk melalui **2 metode penyelesaian**:
     1. **Fuzzy Search ke OpenFoodFacts:** Admin mencari produk ke API OpenFoodFacts berdasarkan **nama produk** (untuk mengatasi kasus barcode produk lokal yang berbeda/belum tertaut di OFF). Jika ketemu, admin tinggal klik *Import* untuk menyimpan dan menautkannya dengan `barcode` tiket ke PostgreSQL.
     2. **Input Gizi Manual:** Admin melihat foto tabel nilai gizi yang diunggah user pada tiket, lalu mengetikkan angka-angka gizinya (Energi, Gula, Natrium, Garam, Lemak, Karbohidrat) secara manual ke form untuk disimpan ke PostgreSQL.
   * Setelah data produk tersimpan, status tiket otomatis berubah menjadi `RESOLVED`.
3. **Manajemen Database Produk (`/admin/products`):**
   * Admin dapat melihat, mengedit, atau menghapus data produk yang tersimpan di PostgreSQL.

---

## 4. Rencana Peralihan Tech Stack & Aturan Bisnis

| Komponen Sistem | Stack Lama (Laravel) | Stack Baru (Next.js + FastAPI) | Catatan Implementasi |
| :--- | :--- | :--- | :--- |
| **Frontend / UI** | Blade Templates (`.blade.php`) | Next.js App Router (`.tsx`) | **Wajib mempertahankan struktur layout 1:1** dengan file Blade lama. |
| **Styling** | Tailwind CSS | **Tailwind CSS** | Salin konfigurasi warna, font, dan kelas utilitas dari proyek Laravel lama. |
| **Database & ORM** | Eloquent ORM | **PostgreSQL + Prisma ORM** | Menyimpan tabel `Product`, `ProductTicket`, dan `Admin`. |
| **Backend API** | Laravel Controllers | Next.js Route Handlers (`app/api/*`) | Orkestrasi ke ML Engine, lookup PostgreSQL, fetch/search OFF, dan tiket admin. |
| **Evaluasi Gizi** | Aturan Kemenkes/PERKENI | **Dummy Rules** (`nutritionEvaluator.ts`) | Gunakan logika ambang batas *dummy* terlebih dahulu; penyesuaian standar Kemenkes dilakukan di tahap akhir. |
| **ML Engine** | Colab Notebook (`.ipynb`) | Python **FastAPI** (`services/ml-engine`) | Murni ekstraksi barcode (YOLOv8 `best.pt` + Sobel + EasyOCR). |

### Catatan Khusus Evaluasi Gizi (Dummy Rules)
* Logika perhitungan status (`AMAN`, `HATI-HATI`, `TIDAK AMAN`) diisolasi dalam satu file khusus: `apps/web/src/services/nutritionEvaluator.ts`.
* Untuk tahap awal migrasi, gunakan **aturan dummy sederhana** (misalnya: mengecek ambang batas angka statis untuk Hipertensi pada parameter Natrium/Garam, dan Diabetes Melitus pada parameter Gula/Karbohidrat).
* Dengan mengisolasi fungsi ini di layer `services/`, penyesuaian rumus medis Kemenkes RI No. 30/2013 & PERKENI 2021 di kemudian hari dapat dilakukan tanpa mengubah kode UI maupun API.

---

## 5. Struktur Folder Monorepo

Struktur ini memisahkan secara tegas antara **View/UI (`app/` & `components/`)** dengan **Service Hit API ML, OpenFoodFacts, dan Database (`services/`)**.

```text
darkim-monorepo/
├── package.json                              # Root workspace monorepo
├── docker-compose.yml                        # Opsional: container PostgreSQL lokal
│
├── apps/
│   └── web/                                  # Aplikasi Utama Next.js (Full-Stack)
│       ├── prisma/
│       │   ├── schema.prisma                 # Model: Product, ProductTicket, Admin
│       │   └── seed.ts                       # Seed akun admin & produk lokal awal
│       ├── public/
│       │   └── uploads/tickets/              # Penyimpanan foto depan & tabel gizi dari user
│       └── src/
│           ├── app/                          # [VIEW & ROUTING LAYER]
│           │   ├── layout.tsx                # Layout utama (adaptasi dari Blade layout)
│           │   ├── globals.css               # Konfigurasi Tailwind CSS
│           │   ├── page.tsx                  # Halaman Utama Scanner (Guest)
│           │   ├── admin/
│           │   │   ├── login/page.tsx        # Halaman Login Admin
│           │   │   ├── tickets/page.tsx      # Dashboard Tiket Laporan & Eksekusi Admin
│           │   │   └── products/page.tsx     # Manajemen Data Produk PostgreSQL
│           │   └── api/                      # [NEXT.JS API ROUTE HANDLERS]
│           │       ├── scan/route.ts         # Orkestrasi: Hit ML -> Cek DB -> Hit OFF
│           │       ├── tickets/route.ts      # Endpoint submit laporan / upload 2 foto
│           │       └── admin/
│           │           ├── off-search/route.ts   # Endpoint Fuzzy Search OFF untuk Admin
│           │           └── resolve/route.ts      # Endpoint simpan produk & tutup tiket
│           │
│           ├── components/                   # [PURE UI COMPONENTS - TANPA LOGIC FETCH]
│           │   ├── scanner/
│           │   │   ├── ProfileSelector.tsx   # Pilihan 2 Profil: Hipertensi / Diabetes Melitus
│           │   │   ├── CameraScanner.tsx     # WebRTC kamera & upload foto
│           │   │   └── ScanResultView.tsx    # Tampilan hasil gizi (sesuai layout Blade)
│           │   ├── modals/
│           │   │   ├── ReportTextModal.tsx   # Modal report textbox + auto barcode
│           │   │   └── ContributePhotoModal.tsx # Modal upload foto depan & tabel gizi
│           │   └── admin/
│           │       ├── TicketDetailModal.tsx # Preview 2 foto user + aksi penyelesaian
│           │       └── OffFuzzySearchBox.tsx # UI pencarian nama produk ke OFF
│           │
│           ├── services/                     # [API CLIENT & BUSINESS LOGIC LAYER]
│           │   ├── mlVisionService.ts        # Khusus hit API Python FastAPI
│           │   ├── openFoodFactsService.ts   # Get by barcode & Fuzzy Search by name ke OFF
│           │   ├── productRepository.ts      # Query & auto-insert ke PostgreSQL (Prisma)
│           │   └── nutritionEvaluator.ts     # Dummy rules evaluasi Hipertensi & Diabetes
│           │
│           ├── lib/
│           │   ├── prisma.ts                 # Koneksi singleton PostgreSQL via Prisma
│           │   └── auth.ts                   # Konfigurasi autentikasi Admin
│           │
│           └── types/
│               └── index.ts                  # Definisi tipe TypeScript (Product, Ticket, Eval)
│
└── services/
    └── ml-engine/                            # Service Python FastAPI (Pure Vision)
        ├── app.py                            # Endpoint POST /api/v1/extract-barcode
        ├── requirements.txt                  # fastapi, uvicorn, ultralytics, easyocr, pyzbar, opencv
        └── models/
            └── best.pt                       # Bobot model YOLOv8n hasil training Colab
```

---

## 6. Notes Styling & Kesesuaian Layout dengan Blade Lama

1. **Acuan Struktur Layout (1:1 Parity dengan Blade):**
   * Seluruh tata letak halaman, posisi tombol kamera, penempatan *card* informasi produk, hingga struktur *modal* harus mengikuti **persis** seperti yang sudah dibuat pada file `.blade.php` di proyek Laravel sebelumnya.
   * Saat proses migrasi komponen UI, periksa langsung struktur DOM dan hierarki elemen pada folder `resources/views/` proyek Laravel lama agar tampilan visual tidak berubah.
2. **Konfigurasi Tailwind CSS:**
   * Gunakan **Tailwind CSS** sebagai satu-satunya framework styling di `apps/web`.
   * Salin kustomisasi tema (warna, *font family*, *spacing*, atau *custom utilities*) dari `tailwind.config.js` dan `resources/css/app.css` proyek Laravel lama ke konfigurasi Tailwind Next.js.
   * Lakukan konversi sintaks standar dari HTML Blade ke React JSX (`class` $\rightarrow$ `className`, `for` $\rightarrow$ `htmlFor`, dan penutupan *self-closing tags*).