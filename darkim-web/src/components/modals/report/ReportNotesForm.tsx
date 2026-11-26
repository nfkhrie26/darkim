import React from 'react';
import { Icons } from '@/components/ui/Icons';

interface ReportNotesFormProps {
  productName?: string;
  barcode?: string;
  description: string;
  setDescription: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

/**
 * ReportNotesForm
 * Form view for submitting general issues/tickets with custom notes.
 */
export default function ReportNotesForm({
  productName,
  barcode,
  description,
  setDescription,
  loading,
  onSubmit,
  onBack,
}: ReportNotesFormProps) {
  return (
    <div>
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
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

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            onClick={onBack}
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
  );
}
