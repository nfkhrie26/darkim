'use client';

import { use } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import AdminHeader from '@/components/admin/AdminHeader';
import OffFuzzySearchBox from '@/components/admin/OffFuzzySearchBox';
import LightboxModal from '@/components/ui/LightboxModal';
import TicketInfoCard from '@/components/admin/tickets/TicketInfoCard';
import TicketPhotoEvidence from '@/components/admin/tickets/TicketPhotoEvidence';
import TicketManualResolveForm from '@/components/admin/tickets/TicketManualResolveForm';
import { useTicketDetail } from '@/hooks/useTicketDetail';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const {
    ticket,
    loading,
    error,
    resolutionMode,
    setResolutionMode,
    isResolving,
    isUserPrefilled,
    name,
    setName,
    brand,
    setBrand,
    category,
    setCategory,
    servingSize,
    setServingSize,
    nutrition,
    updateNutrition,
    previewImage,
    setPreviewImage,
    resolveViaOff,
    resolveViaManual,
  } = useTicketDetail(ticketId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#E6F1EA]">
        <div className="text-center">
          <Icons.Refresh className="w-8 h-8 animate-spin mx-auto mb-2 text-black" />
          <p className="text-sm font-bold text-gray-700">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#E6F1EA]">
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Icons.Alert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-black text-black">Terjadi Kesalahan</h2>
          <p className="text-xs text-gray-600 mt-1 mb-5">{error || 'Tiket tidak ditemukan.'}</p>
          <Link
            href="/admin/tickets"
            className="inline-block bg-black text-white brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider brutal-btn"
          >
            Kembali ke Antrean Tiket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-[#E6F1EA]">
      {/* Standard Admin Navbar */}
      <AdminHeader currentTab="tickets" />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        <div>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-black brutal-btn hover:bg-gray-50"
          >
            <Icons.ArrowLeft className="w-4 h-4 text-black" />
            <span>Kembali ke Antrean Tiket</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Rincian Tiket & Lampiran Foto (Modular Components) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <TicketInfoCard ticket={ticket} />
            <TicketPhotoEvidence
              frontPhoto={ticket.frontPhoto}
              nutritionPhoto={ticket.nutritionPhoto}
              onPreview={setPreviewImage}
            />
          </div>

          {/* Kolom Kanan: Card Resolusi & Mode Switcher */}
          <div className="lg:col-span-7">
            <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#00D084] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black">
                    Eksekusi Admin
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-black">Resolusi Data Produk</h2>
                <p className="text-xs font-semibold text-gray-600 mt-1 leading-relaxed">
                  Pilih metode penyelesaian untuk menyimpan data gizi barcode ini dan mensinkronisasikannya ke Open Food Facts.
                </p>
              </div>

              {/* Neo-Brutalist Mode Switcher Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 brutal-border-sm rounded-2xl">
                <button
                  type="button"
                  onClick={() => setResolutionMode('OFF')}
                  className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer inline-flex items-center justify-center gap-2 ${
                    resolutionMode === 'OFF'
                      ? 'bg-[#00D084] text-black brutal-border brutal-shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 brutal-border-sm'
                  }`}
                >
                  <Icons.Search className="w-4 h-4 text-black" />
                  <span>1. Cari di Open Food Facts (Fuzzy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionMode('MANUAL')}
                  className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer inline-flex items-center justify-center gap-2 ${
                    resolutionMode === 'MANUAL'
                      ? 'bg-[#00D084] text-black brutal-border brutal-shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 brutal-border-sm'
                  }`}
                >
                  <Icons.Table className="w-4 h-4 text-black" />
                  <span>2. Input Gizi Manual</span>
                </button>
              </div>

              {/* Modular Resolution Content */}
              {resolutionMode === 'OFF' ? (
                <OffFuzzySearchBox
                  initialQuery={ticket.description || ''}
                  onSelectCandidate={resolveViaOff}
                  isResolving={isResolving}
                />
              ) : (
                <TicketManualResolveForm
                  name={name}
                  setName={setName}
                  brand={brand}
                  setBrand={setBrand}
                  category={category}
                  setCategory={setCategory}
                  servingSize={servingSize}
                  setServingSize={setServingSize}
                  nutrition={nutrition}
                  updateNutrition={updateNutrition}
                  isUserPrefilled={isUserPrefilled}
                  isResolving={isResolving}
                  onSubmit={resolveViaManual}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal (Modular Component) */}
      <LightboxModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
