'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import ReportTextModal from '@/components/modals/ReportTextModal';
import { HealthProfile, NutritionEvaluation, ProductModel } from '@/types';
import { evaluateNutrition } from '@/services/nutritionEvaluator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;

  const [product, setProduct] = useState<ProductModel | null>(null);
  const [evaluation, setEvaluation] = useState<NutritionEvaluation | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile>('diabetes');
  const [tableMode, setTableMode] = useState<'status' | 'nutrition'>('status');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch or evaluate product data
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: targetId, profile: selectedProfile }),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setEvaluation(data.evaluation || evaluateNutrition(data.product, selectedProfile));
        } else {
          // Fallback to sample if ID is a slug
          const fallbackBarcode = targetId === 'koko-krunch' ? '8991234567890' : '8992753123456';
          const fbRes = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: fallbackBarcode, profile: selectedProfile }),
          });
          const fbData = await fbRes.json();
          if (fbData.success && fbData.product) {
            setProduct(fbData.product);
            setEvaluation(fbData.evaluation);
          }
        }
      } catch (err) {
        console.error('Failed loading product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [targetId]);

  // When profile toggles
  const handleProfileToggle = (newProfile: HealthProfile) => {
    if (newProfile === selectedProfile) {
      showToast(`Filter ${newProfile.toUpperCase()} sedang aktif.`);
      return;
    }
    setSelectedProfile(newProfile);
    showToast(`Filter ${newProfile === 'diabetes' ? 'DIABETES MELITUS' : 'HIPERTENSI'} aktif.`);

    if (product) {
      const newEval = evaluateNutrition(product, newProfile);
      setEvaluation(newEval);
    }
  };

  const words = (product?.name || 'Produk Makanan').split(' ');
  const initials = (words[0]?.[0] || 'D') + (words[1]?.[0] || 'K');

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Navigation Bar: Back Button & Header Branding (No Sidebar) */}
      <header className="w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Back Button (Top-Left) */}
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 bg-white brutal-border brutal-shadow rounded-xl px-4 py-2.5 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer"
          title="Kembali ke Katalog Produk"
        >
          {/* Back Arrow SVG */}
          <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>KEMBALI KE KATALOG</span>
        </Link>

        {/* Branding Logo */}
        <Link
          href="/"
          className="bg-white brutal-border brutal-shadow rounded-xl px-4 py-2 inline-flex items-center gap-1 hover:-translate-y-0.5 transition-transform cursor-pointer"
          title="DARKIM Beranda"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-black">DARK</span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#00D084] relative">
            IM
            <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#00D084] rounded-full"></span>
          </span>
        </Link>
      </header>

      {/* Shopee-like 2-Column Product Detail Layout */}
      {loading || !product || !evaluation ? (
        <div className="w-full max-w-7xl mx-auto flex-1 flex items-center justify-center">
          <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center">
            <p className="font-black text-base text-black mb-1">Memuat informasi gizi produk...</p>
          </div>
        </div>
      ) : (
        <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Product Image Showcase & Quick Actions */}
          <section className="w-full lg:w-[460px] shrink-0 flex flex-col gap-4">
            {/* Main Hero Image Card */}
            <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#1d2731] to-[#0f151c] brutal-border-sm rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center relative select-none">
                {/* Brand Initial Badge */}
                <div className="w-14 h-14 rounded-full border-2 border-amber-300 flex items-center justify-center mb-3 shadow-md bg-black/40">
                  <span className="text-lg font-black text-amber-300">{initials}</span>
                </div>
                <span className="text-base sm:text-lg font-black text-white leading-tight uppercase tracking-tight line-clamp-1">
                  {product.name}
                </span>
                <span className="text-xs font-bold text-sky-300 tracking-wider mt-1 uppercase">
                  {product.category}
                </span>

                {/* Decorative Barcode */}
                <div className="absolute bottom-3 inset-x-8 bg-white/90 rounded px-3 py-1 flex items-center justify-center gap-1 shadow">
                  <div className="w-1 h-4 bg-black"></div>
                  <div className="w-2 h-4 bg-black"></div>
                  <div className="w-0.5 h-4 bg-black"></div>
                  <div className="w-1.5 h-4 bg-black"></div>
                  <div className="w-3 h-4 bg-black"></div>
                  <div className="w-1 h-4 bg-black"></div>
                  <div className="w-2 h-4 bg-black"></div>
                  <span className="text-[10px] font-mono font-bold text-black ml-2 tracking-widest">
                    {product.barcode}
                  </span>
                </div>
              </div>

              {/* Product Attributes Pill Bar */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-black/10 text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00D084]"></span>
                  Barcode Terverifikasi
                </span>
                <span className="bg-gray-100 brutal-border-sm px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase text-black">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Report Button */}
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="w-full bg-white brutal-border brutal-shadow rounded-xl py-3 px-4 flex items-center justify-center gap-2 brutal-btn cursor-pointer"
            >
              <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <span className="font-black text-xs uppercase tracking-wider text-black">
                PRODUK TIDAK SESUAI? LAPORKAN PADA KAMI!
              </span>
            </button>
          </section>

          {/* Right Column: Nutrition Table, Health Analysis & Disease Filters */}
          <section className="flex-1 w-full flex flex-col gap-4">
            {/* Product Title & Brand Meta Box */}
            <div className="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 flex flex-col gap-1">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                {product.brand} • {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-black leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Health Filter Tags (Diabetes & Hipertensi - Mutually Exclusive) */}
            <div className="flex items-center gap-2.5 flex-wrap" role="radiogroup" aria-label="Filter Kondisi Kesehatan">
              <button
                type="button"
                role="radio"
                aria-checked={selectedProfile === 'diabetes'}
                onClick={() => handleProfileToggle('diabetes')}
                className={`brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer ${
                  selectedProfile === 'diabetes' ? 'bg-[#00D084] text-black' : 'bg-white text-black'
                }`}
              >
                Diabetes
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={selectedProfile === 'hipertensi'}
                onClick={() => handleProfileToggle('hipertensi')}
                className={`brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer ${
                  selectedProfile === 'hipertensi' ? 'bg-[#00D084] text-black' : 'bg-white text-black'
                }`}
              >
                Hipertensi
              </button>
            </div>

            {/* Warning & Health Advice Card */}
            <div className="w-full flex flex-col items-start">
              <div
                className="brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1 text-xs sm:text-sm font-black uppercase tracking-wider mb-2"
                style={{
                  backgroundColor: evaluation.badgeBg,
                  color: evaluation.badgeBg === '#FF4D4D' ? '#FFFFFF' : '#000000',
                }}
              >
                {evaluation.badge}
              </div>

              <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Safe Points */}
                  <div className="flex flex-col gap-2.5">
                    {evaluation.safePoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">
                          ✓
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Warning Points */}
                  <div className="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
                    {evaluation.warningPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span className="text-amber-500 text-base shrink-0 leading-none">⚠️</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Table (Switchable Mode) */}
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setTableMode(tableMode === 'status' ? 'nutrition' : 'status')}
                  className="text-[11px] font-black uppercase text-gray-700 hover:text-black underline cursor-pointer"
                >
                  Ganti Tampilan Tabel ({tableMode === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'})
                </button>
              </div>

              {tableMode === 'status' ? (
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
                      {evaluation.statusTable.map((item, i) => {
                        let badgeClass = 'bg-[#00D084] text-black';
                        if (item.statusColor === 'red') badgeClass = 'bg-[#FF4D4D] text-white';
                        else if (item.statusColor === 'yellow') badgeClass = 'bg-[#FFD027] text-black';
                        return (
                          <tr key={i} className="border-b-2 border-black last:border-b-0">
                            <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">{item.zat}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm ${badgeClass}`}>
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
                      {evaluation.nutritionTable.map((item, i) => (
                        <tr key={i} className="border-b border-black/10 last:border-b-0">
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
        </main>
      )}

      {/* Report Modal */}
      <ReportTextModal
        isOpen={reportModalOpen}
        barcode={product?.barcode || targetId}
        onClose={() => setReportModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

