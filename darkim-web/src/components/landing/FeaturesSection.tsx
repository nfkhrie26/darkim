'use client';

import { Icons } from '@/components/ui/Icons';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Pemindai Barcode & AI Vision',
      description:
        'Pindai barcode kemasan makanan dan minuman menggunakan kamera ponsel secara real-time. Dilengkapi deteksi cerdas multi-pass OCR untuk kemasan yang melengkung atau buram.',
      icon: Icons.Barcode,
      accentBg: 'bg-[#00D084]',
    },
    {
      title: 'Dual Profil Kesehatan',
      description:
        'Pilih antara profil Diabetes Melitus atau Hipertensi. Sistem secara otomatis menyesuaikan batas aman ambang zat gizi sesuai dengan parameter kesehatan yang Anda pilih.',
      icon: Icons.Heart,
      accentBg: 'bg-[#FFD027]',
    },
    {
      title: 'Database Terbuka Open Food Facts',
      description:
        'Terhubung langsung dengan Open Food Facts, platform data pangan terbuka global. Jutaan produk dapat diakses secara langsung tanpa ketergantungan pada server lokal.',
      icon: Icons.Globe,
      accentBg: 'bg-[#00D084]',
    },
    {
      title: 'Crowdsourcing & Verifikasi Transparan',
      description:
        'Bantu sesama pengguna dengan mengunggah foto kemasan atau menginput gizi mandiri untuk produk yang belum terdaftar, ditinjau secara transparan oleh administrator.',
      icon: Icons.Table,
      accentBg: 'bg-[#FFD027]',
    },
  ];

  return (
    <section className="w-full mb-8">
      {/* Section Heading */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Fitur Utama Aplikasi
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 max-w-2xl">
          Dirancang untuk memberikan kemudahan dan kepastian dalam memilih makanan sehat sehari-hari.
        </p>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-xl ${feature.accentBg} brutal-border-sm brutal-shadow-sm flex items-center justify-center mb-4`}
                >
                  <IconComponent className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
