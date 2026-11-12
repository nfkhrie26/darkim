'use client';

import { useState } from 'react';
import { HealthProfile, NutritionEvaluation, ProductModel } from '@/types';
import ProfileSelector from './ProfileSelector';

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
}: ScanResultViewProps) {
  // 1. Tampilan Loading Spinner saat sedang proses Scanning
  if (isScanning) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        {/* Profile Selector tetap tampil */}
        <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-5 min-h-[380px]">
          {/* Neo-brutalist custom spinner */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-black border-t-[#00D084] border-r-[#FFD027] animate-spin"></div>
            {/* Inner box */}
            <div className="w-10 h-10 bg-[#FFD027] brutal-border-sm rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-black animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="font-black text-base sm:text-lg text-black uppercase tracking-tight">
              Mengekstrak Barcode & Menganalisis Gizi...
            </span>
            <p className="text-xs font-bold text-gray-500 max-w-xs leading-relaxed">
              AI Vision Engine sedang mendeteksi barcode kemasan dan mencocokkan nilai nutrisi dengan profil kesehatan Anda.
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
        <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-center">
          {/* Red Warning/Error Icon Box */}
          <div className="w-16 h-16 rounded-2xl bg-[#FF4D4D] brutal-border brutal-shadow flex items-center justify-center text-white text-3xl font-black">
            ✕
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-black text-base sm:text-lg text-black uppercase tracking-tight">
              Gagal Mendeteksi Barcode
            </span>
            <p className="text-xs sm:text-sm font-bold text-red-600 max-w-md leading-relaxed bg-red-50 brutal-border-sm rounded-xl py-2 px-3 mt-1">
              {scanError}
            </p>
          </div>

          {/* Tips Card */}
          <div className="w-full max-w-md bg-amber-50 brutal-border-sm rounded-xl p-3 text-left flex flex-col gap-1.5 text-xs font-semibold text-black">
            <span className="font-black uppercase text-[11px] text-amber-800">💡 Tips agar barcode mudah terbaca:</span>
            <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-[11px]">
              <li>Posisikan barcode berada tepat di tengah area pemindaian.</li>
              <li>Hindari pantulan cahaya lampu atau bayangan pekat pada garis barcode.</li>
              <li>Pastikan permukaan kemasan tidak terlipat atau buram (fokus).</li>
            </ul>
          </div>

          {/* Action Buttons: Reset & Restore */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 w-full max-w-md">
            {hasPreviousData && (
              <button
                type="button"
                onClick={onRestorePrevious}
                className="flex-1 bg-white hover:bg-gray-50 text-black brutal-border brutal-shadow-sm px-4 py-2.5 rounded-xl font-black text-xs uppercase brutal-btn cursor-pointer"
              >
                ← Kembali ke Informasi Sebelumnya
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="flex-1 bg-[#00D084] hover:bg-[#00be78] text-black brutal-border brutal-shadow-sm px-4 py-2.5 rounded-xl font-black text-xs uppercase brutal-btn cursor-pointer"
            >
              🔄 Reset / Pindai Ulang
            </button>
          </div>
        </div>
      </section>
    );
  }
  if (!product || !evaluation) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        {/* Profile Selector tetap bisa dipilih di awal */}
        <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F1EA] brutal-border brutal-shadow flex items-center justify-center text-3xl">
            🔍
          </div>
          <p className="font-black text-base text-black">Belum Ada Produk yang Dipindai</p>
          <p className="text-xs font-semibold text-gray-500 max-w-sm">
            Ambil foto barcode kemasan menggunakan kamera atau unggah foto dari galeri. AI Vision Engine akan mendeteksi barcode dan mengevaluasi status gizinya secara otomatis.
          </p>
        </div>
      </section>
    );
  }

  // Derive initials for thumbnail
  const words = product.name.split(' ');
  const initials = (words[0]?.[0] || 'D') + (words[1]?.[0] || 'K');

  return (
    <section className="flex-1 w-full flex flex-col gap-4">
      {/* 1. Product Header: Image Thumbnail + Product Title Box */}
      <div className="flex items-center gap-3 w-full">
        {/* Product Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white brutal-border brutal-shadow rounded-xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-[#1b2b34] rounded-lg border border-black flex flex-col items-center justify-center p-1 text-center shadow-inner relative">
            <div className="w-5 h-5 rounded-full border border-amber-300 flex items-center justify-center mb-0.5">
              <span className="text-[7px] text-amber-300 font-bold">{initials}</span>
            </div>
            <span className="text-[8px] font-black text-white leading-tight uppercase tracking-tighter line-clamp-1">
              {product.brand}
            </span>
            <span className="text-[6px] font-bold text-sky-300 tracking-tighter line-clamp-1">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Name Box */}
        <div className="flex-1 bg-white brutal-border brutal-shadow rounded-xl px-4 py-3 flex items-center">
          <h2 className="text-sm sm:text-base font-black text-black leading-snug">
            {product.name}
          </h2>
        </div>
      </div>

      {/* 2. Health Profile Selector */}
      <ProfileSelector selectedProfile={selectedProfile} onSelectProfile={onSelectProfile} />

      {/* 3. Warning Card Section */}
      <div className="w-full flex flex-col items-start">
        {/* Header Badge */}
        <div
          className="brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1 text-xs sm:text-sm font-black uppercase tracking-wider mb-2"
          style={{
            backgroundColor: evaluation.badgeBg,
            color: evaluation.badgeBg === '#FF4D4D' ? '#FFFFFF' : '#000000',
          }}
        >
          {evaluation.badge}
        </div>

        {/* Main Warning & Health Advice Card */}
        <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Safe Points (Green Checkmarks) */}
            <div className="flex flex-col gap-2.5">
              {evaluation.safePoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">
                    ✓
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Right Column: Warning Points (Yellow Warning Icon) */}
            <div className="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
              {evaluation.warningPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                  <span className="text-amber-500 text-base shrink-0 leading-none">⚠️</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Nutrition Table (Switchable Mode) */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onToggleTableMode}
            className="text-[11px] font-black uppercase text-gray-700 hover:text-black underline cursor-pointer"
          >
            Ganti Tampilan Tabel ({tableMode === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'})
          </button>
        </div>

        {tableMode === 'status' ? (
          /* View 1: Status Table with Yellow Header */
          <div className="w-full bg-white brutal-border brutal-shadow rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFD027] border-b-2 border-black text-black font-black text-xs sm:text-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-1/3">ZAT GIZI</th>
                  <th className="py-2.5 px-3 w-1/3 text-center">STATUS</th>
                  <th className="py-2.5 px-3 w-1/3 text-right">JUMLAH</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {evaluation.statusTable.map((item, idx) => {
                  let badgeClass = 'bg-[#00D084] text-black';
                  if (item.statusColor === 'red') {
                    badgeClass = 'bg-[#FF4D4D] text-white';
                  } else if (item.statusColor === 'yellow') {
                    badgeClass = 'bg-[#FFD027] text-black';
                  }
                  return (
                    <tr key={idx} className="border-b-2 border-black last:border-b-0">
                      <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">{item.zat}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm ${badgeClass}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">{item.jumlah}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* View 2: Informasi Nilai Gizi Table */
          <div className="w-full bg-white brutal-border brutal-shadow rounded-xl p-4">
            <h3 className="text-center font-black text-sm uppercase tracking-wide text-black pb-2 mb-2 border-b-2 border-black">
              Informasi Nilai Gizi
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black/20 text-xs font-bold text-gray-700">
                  <th className="py-1.5 px-2">Zat gizi</th>
                  <th className="py-1.5 px-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.nutritionTable.map((item, idx) => (
                  <tr key={idx} className="border-b border-black/10 last:border-b-0">
                    <td className="py-1.5 px-2 text-xs font-semibold text-gray-800">{item.zat}</td>
                    <td className="py-1.5 px-2 text-right text-xs font-bold text-black">{item.jumlah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

