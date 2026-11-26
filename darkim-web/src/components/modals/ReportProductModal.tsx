'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import ContributePhotoTab from './contribute/ContributePhotoTab';
import ReportChoiceView from './report/ReportChoiceView';
import ReportNotesForm from './report/ReportNotesForm';

interface ReportProductModalProps {
  isOpen: boolean;
  barcode: string;
  productName?: string;
  brand?: string;
  category?: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

/**
 * ReportProductModal
 * Modular Modal Container coordinating:
 * - 'choice': ReportChoiceView
 * - 'nutrition': ContributePhotoTab (direct contribution flow)
 * - 'notes': ReportNotesForm (ticket submission)
 */
export default function ReportProductModal({
  isOpen,
  barcode,
  productName,
  brand,
  category,
  onClose,
  onSubmitSuccess,
}: ReportProductModalProps) {
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
        className={`bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full relative duration-150 max-h-[90vh] overflow-y-auto ${
          mode === 'nutrition' ? 'max-w-xl' : 'max-w-lg'
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

        {/* 1. Choice Mode */}
        {mode === 'choice' && (
          <ReportChoiceView
            productName={productName}
            barcode={barcode}
            onSelectNutrition={() => setMode('nutrition')}
            onSelectNotes={() => setMode('notes')}
            onClose={onClose}
          />
        )}

        {/* 2. Nutrition Contribution Wizard Mode */}
        {mode === 'nutrition' && (
          <div>
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

        {/* 3. Form Catatan Mode */}
        {mode === 'notes' && (
          <ReportNotesForm
            productName={productName}
            barcode={barcode}
            description={description}
            setDescription={setDescription}
            loading={loading}
            onSubmit={handleSubmitNotes}
            onBack={() => setMode('choice')}
          />
        )}
      </div>
    </div>
  );
}
