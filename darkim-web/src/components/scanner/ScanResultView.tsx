'use client';

import { HealthProfile, NutritionEvaluation, ProductModel } from '@/types';
import ProfileSelector from './ProfileSelector';
import NutritionTable from './NutritionTable';
import StatusHeaderBar from './StatusHeaderBar';
import { Icons } from '@/components/ui/Icons';

interface ScanResultViewProps {
  product: ProductModel | null;
  evaluation: NutritionEvaluation | null;
  selectedProfile: HealthProfile;
  onSelectProfile: (profile: HealthProfile) => void;
  tableMode: 'status' | 'nutrition';
  onToggleTableMode: () => void;
  isScanning?: boolean;
  scanError?: string | null;
  hasPreviousData?: boolean;
  onReset?: () => void;
  onRestorePrevious?: () => void;
  onOpenReport?: () => void;
  onOpenContribute?: () => void;
  onOpenScanner?: () => void;
}

export default function ScanResultView({
  product,
  evaluation,
  selectedProfile,
  onSelectProfile,
  tableMode,
  onToggleTableMode,
  isScanning = false,
  scanError = null,
  hasPreviousData = false,
  onReset,
  onRestorePrevious,
  onOpenReport,
  onOpenContribute,
  onOpenScanner,
}: ScanResultViewProps) {
  // 1. Tampilan Loading Spinner saat sedang proses Scanning
  if (isScanning) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        {/* Profile Selector */}
        <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-5 min-h-[360px]">
          {/* Neo-brutalist custom spinner */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-black border-t-[#00D084] border-r-[#FFD027] animate-spin"></div>
            <div className="w-10 h-10 bg-[#FFD027] brutal-border-sm rounded-lg flex items-center justify-center shadow-sm">
              <Icons.Barcode className="w-5 h-5 text-black animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="font-black text-base sm:text-lg text-black uppercase tracking-tight">
              Menganalisis Nilai Gizi...
            </span>
            <p className="text-xs font-bold text-gray-500 max-w-xs leading-relaxed">
              AI sedang mencocokkan kandungan nutrisi kemasan dengan profil kesehatan Anda.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 2. Tampilan Khusus Saat Gagal Mendeteksi Barcode
  if (scanError) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="bg-white hover:bg-gray-50 text-black brutal-border-sm brutal-shadow-sm px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer brutal-btn"
            >
              <Icons.Camera className="w-4 h-4 text-black" />
              <span>Buka Kamera Lagi</span>
            </button>
          )}
        </div>

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4D4D] brutal-border brutal-shadow flex items-center justify-center text-white">
            <Icons.Close className="w-7 h-7 text-white" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-black text-base sm:text-lg text-black uppercase tracking-tight">
              Gagal Mendeteksi Barcode
            </span>
            <p className="text-xs sm:text-sm font-bold text-red-600 max-w-md leading-relaxed bg-red-50 brutal-border-sm rounded-xl py-2 px-3 mt-1">
              {scanError}
            </p>
          </div>

          {/* Clean Tips Helper */}
          <div className="w-full max-w-md bg-amber-50 brutal-border-sm rounded-xl p-3 text-left flex items-start gap-2.5 text-xs font-semibold text-amber-900">
            <Icons.Alert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Posisikan barcode berjarak sekitar 20-30 cm agar kamera fokus, atau gunakan tab <strong>Galeri</strong> untuk memilih foto kemasan dari perangkat.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 w-full max-w-md">
            {hasPreviousData && (
              <button
                type="button"
                onClick={onRestorePrevious}
                className="flex-1 bg-white hover:bg-gray-50 text-black brutal-border brutal-shadow-sm px-4 py-2.5 rounded-xl font-black text-xs uppercase brutal-btn cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Icons.ArrowLeft className="w-4 h-4 text-black" />
                <span>Produk Sebelumnya</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenScanner || onReset}
              className="flex-1 bg-[#00D084] hover:bg-[#00be78] text-black brutal-border brutal-shadow-sm px-4 py-2.5 rounded-xl font-black text-xs uppercase brutal-btn cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Icons.Refresh className="w-4 h-4 text-black" />
              <span>Pindai Ulang</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 3. State awal sebelum pemindaian
  if (!product || !evaluation) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F1EA] brutal-border brutal-shadow flex items-center justify-center">
            <Icons.Search className="w-8 h-8 text-black" />
          </div>
          <p className="font-black text-base text-black">Siap Memindai Produk</p>
          <p className="text-xs font-semibold text-gray-500 max-w-sm">
            Arahkan kamera ke barcode kemasan atau pilih foto dari galeri. Hasil evaluasi gizi akan langsung tampil di sini.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 w-full flex flex-col gap-4">
      {/* 1. Product Header: Title Box + Scan Again Button */}
      <div className="flex items-center justify-between gap-3 w-full flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Product Thumbnail */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white brutal-border brutal-shadow rounded-xl shrink-0 flex items-center justify-center overflow-hidden p-1">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Icons.Food className="w-7 h-7 text-gray-500" />
            )}
          </div>

          {/* Product Name & Brand */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 block">
              {product.brand || 'Produk Pangan'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-black leading-snug line-clamp-2">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Tombol Pindai Produk Lain (Kembali ke Kamera) */}
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="bg-[#FFD027] hover:bg-[#ffe066] text-black brutal-border-sm brutal-shadow-sm px-3.5 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 brutal-btn cursor-pointer shrink-0"
            title="Buka kamera untuk memindai produk lain"
          >
            <Icons.Camera className="w-4 h-4 text-black" />
            <span>Pindai Lainnya</span>
          </button>
        )}
      </div>

      {/* 2. Health Profile Selector */}
      <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

      {/* 3. Warning Card Section */}
      <div className="w-full flex flex-col items-start">
        {/* Header Badge (Left) + Mirrored Red Report Button (Right) */}
        <StatusHeaderBar
          badge={evaluation.badge}
          badgeBg={evaluation.badgeBg}
          onOpenReport={onOpenReport}
        />

        {/* Main Warning & Health Advice Card */}
        <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
          {evaluation.isDataIncomplete && (
            <div className="mb-4 bg-amber-100 brutal-border-sm rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icons.Alert className="w-5 h-5 text-amber-800 shrink-0" />
                <p className="text-xs font-bold text-amber-900 leading-snug">
                  Data gizi produk ini belum lengkap pada database. Bantu komunitas dengan melaporkan atau mengunggah foto tabel gizi!
                </p>
              </div>
              {(onOpenContribute || onOpenReport) && (
                <button
                  type="button"
                  onClick={onOpenContribute || onOpenReport}
                  className="bg-[#00D084] hover:bg-[#00be78] text-black brutal-border-sm brutal-shadow-sm px-3 py-1.5 rounded-lg text-xs font-black uppercase brutal-btn shrink-0 cursor-pointer"
                >
                  + Lengkapi Data
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Safe Points (Green Checkmarks) */}
            <div className="flex flex-col gap-2.5">
              {evaluation.safePoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5">
                    <Icons.Check className="w-2.5 h-2.5 text-white" />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Right Column: Warning Points (Yellow Warning Icon) */}
            <div className="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
              {evaluation.warningPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                  <Icons.Alert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Nutrition Table (Switchable Mode) */}
      <NutritionTable
        evaluation={evaluation}
        tableMode={tableMode}
        onToggleTableMode={onToggleTableMode}
      />
    </section>
  );
}
