'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';

interface ReportTextModalProps {
  isOpen: boolean;
  barcode: string;
  productName?: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export default function ReportTextModal({
  isOpen,
  barcode,
  productName,
  onClose,
  onSubmitSuccess,
}: ReportTextModalProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 cursor-pointer transition-colors"
          title="Tutup"
        >
          <Icons.Close className="w-5 h-5 text-black" />
        </button>

        <h3 className="text-base sm:text-lg font-black text-black mb-1">
          Laporkan Ketidaksesuaian Produk
        </h3>
        {(productName || barcode) && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mb-3">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cth: Scan ultra milk, tapi yang muncul bir bintang..."
            className="w-full brutal-border-sm rounded-xl p-3.5 text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none bg-white placeholder:text-gray-400"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'KIRIM LAPORAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

