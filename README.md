# DARKIM

Sistem Pendukung Keputusan Evaluasi Nilai Gizi Pangan Berbasis **Computer Vision & Next.js Full-Stack**.

---

## 🏗️ Struktur Project

```text
DARKIM/ (Root)
├── darkim-web/                # Aplikasi Full-Stack Next.js 15 (App Router + PostgreSQL)
│   ├── prisma/                # Schema & Seed Database PostgreSQL
│   ├── public/                # Static assets & barcode placeholder
│   ├── src/
│   │   ├── app/               # Halaman UI & API Route Handlers
│   │   ├── components/        # Pure UI Components (Neo-Brutalist)
│   │   ├── services/          # ML Client, OpenFoodFacts, Evaluator, Repo
│   │   └── lib/               # Prisma singleton & Auth
│   ├── package.json           # Dependensi Web
│   └── .env                   # Konfigurasi Database & Endpoint ML
│
└── darkim-ml/                 # Layanan Computer Vision Python FastAPI
    ├── app.py                 # Endpoint /api/v1/extract-barcode
    ├── requirements.txt       # Dependensi ML (FastAPI, OpenCV, YOLO, Pyzbar)
    └── models/                # Tempat menyimpan bobot best.pt
```

---

## 🚀 Panduan Menjalankan

### 1. Jalankan Website (`darkim-web`)
```bash
cd darkim-web

# Install dependencies (jika belum)
npm install

# Setup database & seed data awal
npm run db:push
npm run db:seed

# Jalankan server development
npm run dev

# ATAU jalankan mode production
npm run build
npm run start
```
Aplikasi web dapat diakses di [http://localhost:3000](http://localhost:3000).

### 2. Jalankan Vision Engine (`darkim-ml`)
```bash
cd darkim-ml

# Install dependensi Python
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn app:app --port 8000 --reload
```
Vision engine aktif di [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 🔑 Kredensial Administrator
- URL Login Admin: `http://localhost:3000/admin/login`
- Username: `admin`
- Password: `admin123`
