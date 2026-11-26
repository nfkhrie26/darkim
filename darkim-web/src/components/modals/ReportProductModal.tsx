'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import ContributePhotoTab from './contribute/ContributePhotoTab';

interface ReportProductModalProps {
  isOpen: boolean;
  barcode: string;
  productName?: string;
  brand?: string;
  category?: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export default function ReportProductModal({
  isOpen,
  barcode,
  productName,
  brand,
  category,
  onClose,
  onSubmitSuccess,
}: ReportProductModalProps) {
  // Navigation mode: 'choice' -> 'nutrition' (pelengkapan data) | 'notes' (form catatan)
  const [mode, setMode] = useState<'choice' | 'nutrition' | 'notes'>('choice');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset to initial choice whenever modal is reopened
  useEffect(() => {
    if (isOpen) {
      setMode('choice');
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const formattedDescription = productName
        ? `[Produk: ${productName}] ${description.trim()}`
        : description.trim();

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: barcode || 'MANUAL-REPORT',
          description: formattedDescription,
        }),
      });

      if (res.ok) {
        setDescription('');
        onClose();
        onSubmitSuccess('Laporan ketidaksesuaian berhasil dikirim ke Admin!');
      } else {
        alert('Gagal mengirim laporan. Coba lagi.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleContributeSuccess = (msg: string) => {
    onClose();
    onSubmitSuccess(msg);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div
        className={`bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full relative duration-150 max-h-[90vh] overflow-y-auto ${mode === 'nutrition' ? 'max-w-xl' : 'max-w-lg'
          }`}
      >
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 cursor-pointer transition-colors z-10"
          title="Tutup"
        >
          <Icons.Close className="w-5 h-5 text-black" />
        </button>

        {/* ---------------------------------------------------- */}
        {/* MODE 1: PILIHAN ALASAN LAPORAN                      */}
        {/* ---------------------------------------------------- */}
        {mode === 'choice' && (
          <div>
            <div className="mb-4">
              <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
                Laporan Produk
              </span>
              <h3 className="text-base sm:text-lg font-black text-black mt-1">
                Pilih Alasan Laporan
              </h3>
              <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
                Pilih jenis kendala yang Anda temukan agar laporan dapat ditangani dengan tepat:
              </p>

              {(productName || barcode) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mt-2.5">
                  {productName && (
                    <span className="bg-[#E6F1EA] brutal-border-sm px-2 py-0.5 rounded text-black font-black">
                      {productName}
                    </span>
                  )}
                  {barcode && (
                    <span className="font-mono text-black bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded">
                      {barcode}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {/* Opsi 1: Data Gizi Tidak Lengkap atau Tidak Akurat -> Arahkan ke Pelengkapan Data */}
              <button
                type="button"
                onClick={() => setMode('nutrition')}
                className="w-full text-left bg-white hover:bg-emerald-50/70 brutal-border brutal-shadow-sm rounded-2xl p-4 transition-all duration-150 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#00D084] brutal-border-sm flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                  <Icons.Table className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-emerald-900">
                      Data Gizi Tidak Lengkap atau Tidak Akurat
                    </h4>
                  </div>
                </div>
              </button>

              {/* Opsi 2: Kendala Lainnya -> Arahkan ke Form Catatan */}
              <button
                type="button"
                onClick={() => setMode('notes')}
                className="w-full text-left bg-white hover:bg-amber-50/70 brutal-border brutal-shadow-sm rounded-2xl p-4 transition-all duration-150 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FFD027] brutal-border-sm flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                  <Icons.Flag className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-amber-950">
                      Kendala Lainnya
                    </h4>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-black/10 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 2: MODAL PELENGKAPAN DATA                       */}
        {/* ---------------------------------------------------- */}
        {mode === 'nutrition' && (
          <div>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setMode('choice')}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-gray-700 hover:text-black mb-3 cursor-pointer group"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5 text-black group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Pilihan</span>
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#00D084] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
                  Pelengkapan Data Gizi
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-black">
                Bantu Lengkapi Data Produk
              </h3>
              <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
                Unggah foto produk kemasan depan. Jika foto tabel informasi gizi tidak tersedia, Anda dapat menginput nilai gizinya pada langkah berikutnya.
              </p>
              {(barcode || productName) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mt-2">
                  {productName && (
                    <span className="bg-[#E6F1EA] brutal-border-sm px-2 py-0.5 rounded text-black font-black">
                      {productName}
                    </span>
                  )}
                  {barcode && (
                    <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-black font-mono">
                      {barcode}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Linear Wizard for Contribution */}
            <ContributePhotoTab
              barcode={barcode}
              initialName={productName}
              initialBrand={brand}
              initialCategory={category}
              onSuccess={handleContributeSuccess}
              onClose={onClose}
            />
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 3: FORM CATATAN KENDALA LAINNYA                */}
        {/* ---------------------------------------------------- */}
        {mode === 'notes' && (
          <div>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setMode('choice')}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-gray-700 hover:text-black mb-3 cursor-pointer group"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5 text-black group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Pilihan</span>
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
                  Form Catatan Kendala
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-black">
                Laporkan Kendala Lainnya
              </h3>
              <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
                Jelaskan ketidaksesuaian yang Anda temukan pada produk ini untuk ditinjau oleh admin:
              </p>
              {(productName || barcode) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mt-2">
                  {productName && (
                    <span className="bg-[#E6F1EA] brutal-border-sm px-2 py-0.5 rounded text-black font-black">
                      {productName}
                    </span>
                  )}
                  {barcode && (
                    <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-black font-mono">
                      {barcode}
                    </span>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitNotes} className="flex flex-col gap-4">
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cth: Barcode terdaftar sebagai biskuit, namun fisiknya adalah kemasan susu cokelat..."
                className="w-full brutal-border-sm rounded-xl p-3.5 text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none bg-white placeholder:text-gray-400"
                required
              />

              <div className="flex justify-end items-center gap-2 pt-2 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => setMode('choice')}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Mengirim...' : 'KIRIM LAPORAN'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
