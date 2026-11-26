'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import DarkimLogo from '@/components/DarkimLogo';
import ReportTextModal from '@/components/modals/ReportTextModal';
import NutritionTable from '@/components/scanner/NutritionTable';
import StatusHeaderBar from '@/components/scanner/StatusHeaderBar';
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
  const [heroImgError, setHeroImgError] = useState(false);

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
      {/* Top Navigation Bar: Back Button & Always Floating DARKIM Branding */}
      <header className="sticky top-3 sm:top-4 z-40 w-full max-w-7xl mx-auto mb-6 flex items-center justify-between gap-3 pointer-events-none">
        {/* Back Button (Top-Left) */}
        <Link
          href="/katalog"
          className="pointer-events-auto inline-flex items-center gap-2 bg-white brutal-border brutal-shadow rounded-xl px-3.5 sm:px-4 py-2.5 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer"
          title="Kembali ke Katalog Produk"
        >
          {/* Back Arrow SVG */}
          <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">KEMBALI KE KATALOG</span>
          <span className="sm:hidden">KATALOG</span>
        </Link>

        {/* Always Floating DARKIM Branding Logo */}
        <div className="pointer-events-auto shrink-0">
          <DarkimLogo />
        </div>
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
              <div
                className={`w-full aspect-[4/3] ${
                  product.image && !heroImgError
                    ? 'bg-white'
                    : 'bg-gradient-to-br from-[#1d2731] to-[#0f151c] p-6'
                } brutal-border-sm rounded-xl overflow-hidden flex flex-col items-center justify-center text-center relative select-none`}
              >
                {product.image && !heroImgError ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-contain p-4 pb-12"
                  />
                ) : (
                  <>
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
                  </>
                )}

                {/* Decorative Barcode */}
                <div className="absolute bottom-3 inset-x-8 bg-white/95 brutal-border-sm rounded px-3 py-1 flex items-center justify-center gap-1 shadow">
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
              <StatusHeaderBar
                badge={evaluation.badge}
                badgeBg={evaluation.badgeBg}
                onOpenReport={() => setReportModalOpen(true)}
              />

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
            <NutritionTable
              evaluation={evaluation}
              tableMode={tableMode}
              onToggleTableMode={() => setTableMode(tableMode === 'status' ? 'nutrition' : 'status')}
            />
          </section>
        </main>
      )}

      {/* Report Modal */}
      <ReportTextModal
        isOpen={reportModalOpen}
        barcode={product?.barcode || targetId}
        productName={product?.name}
        onClose={() => setReportModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

