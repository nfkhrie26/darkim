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
}

export default function ScanResultView({
  product,
  evaluation,
  selectedProfile,
  onSelectProfile,
  tableMode,
  onToggleTableMode,
}: ScanResultViewProps) {
  if (!product || !evaluation) {
    return (
      <section className="flex-1 w-full flex flex-col gap-4">
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center">
          <p className="font-black text-base text-black mb-1">Arahkan kamera ke barcode untuk melihat informasi gizi.</p>
          <p className="text-xs font-semibold text-gray-500">Pilih profil kesehatan di atas untuk analisis risiko yang spesifik.</p>
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

