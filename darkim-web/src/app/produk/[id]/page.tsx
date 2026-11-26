'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import DarkimLogo from '@/components/DarkimLogo';
import ReportProductModal from '@/components/modals/ReportProductModal';
import NutritionTable from '@/components/scanner/NutritionTable';
import StatusHeaderBar from '@/components/scanner/StatusHeaderBar';
import HealthEvaluationPoints from '@/components/scanner/HealthEvaluationPoints';
import ProductHeroShowcase from '@/components/product/ProductHeroShowcase';
import { Icons } from '@/components/ui/Icons';
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
      return;
    }
    setSelectedProfile(newProfile);

    if (product) {
      const newEval = evaluateNutrition(product, newProfile);
      setEvaluation(newEval);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 lg:pt-3.5 pb-8">
      {/* Top Navigation Bar: Back Button & Always Floating DARKIM Branding */}
      <header className="sticky top-2 sm:top-2.5 z-40 w-full max-w-7xl mx-auto mb-3 sm:mb-4 flex items-center justify-between gap-3 pointer-events-none">
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
          {/* Left Column: Modular Product Image Showcase (Sticky on Desktop) */}
          <ProductHeroShowcase
            product={product}
            heroImgError={heroImgError}
            onImgError={() => setHeroImgError(true)}
          />

          {/* Right Column: Nutrition Table, Health Analysis & Disease Filters (Scrollable within bounds below header) */}
          <section className="flex-1 w-full flex flex-col gap-4 lg:max-h-[calc(100vh-84px)] lg:overflow-y-auto lg:pr-3 lg:pb-8 custom-scrollbar">
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

            {/* Warning & Health Advice Card (Card Ringkasan) */}
            <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
              <StatusHeaderBar
                badge={evaluation.badge}
                badgeBg={evaluation.badgeBg}
              />

              <HealthEvaluationPoints
                safePoints={evaluation.safePoints}
                warningPoints={evaluation.warningPoints}
              />
            </div>

            {/* Nutrition Table (Switchable Mode) */}
            <NutritionTable
              evaluation={evaluation}
              tableMode={tableMode}
              onToggleTableMode={() => setTableMode(tableMode === 'status' ? 'nutrition' : 'status')}
            />

            {/* Tombol Laporkan Ketidaksesuaian Data (Di Bawah Tabel Informasi Gizi) */}
            <div className="w-full flex items-center justify-center sm:justify-end pt-1">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                title="Produk Tidak Sesuai? Laporkan Pada Kami!"
                className="w-full sm:w-auto bg-[#FF4D4D] hover:bg-[#e63e3e] text-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 brutal-btn cursor-pointer"
              >
                <Icons.Flag className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Produk Tidak Sesuai? Laporkan</span>
              </button>
            </div>
          </section>
        </main>
      )}

      {/* Report Modal with Choice Options (Data Gizi vs Kendala Lainnya) */}
      <ReportProductModal
        isOpen={reportModalOpen}
        barcode={product?.barcode || targetId}
        productName={product?.name}
        brand={product?.brand}
        category={product?.category}
        onClose={() => setReportModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

