'use client';

import { useState } from 'react';

interface ContributePhotoModalProps {
  isOpen: boolean;
  barcode: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export default function ContributePhotoModal({
  isOpen,
  barcode,
  onClose,
  onSubmitSuccess,
}: ContributePhotoModalProps) {
  const [description, setDescription] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [nutritionFile, setNutritionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile && !nutritionFile) {
      alert('Harap unggah minimal salah satu foto (depan atau tabel gizi).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode || 'MANUAL-CONTRIBUTE');
      if (description) formData.append('description', description);
      if (frontFile) formData.append('frontPhoto', frontFile);
      if (nutritionFile) formData.append('nutritionPhoto', nutritionFile);

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setFrontFile(null);
        setNutritionFile(null);
        setDescription('');
        onClose();
        onSubmitSuccess('Foto produk berhasil dikirim! Admin akan segera mengevaluasi data gizi.');
      } else {
        alert('Gagal mengunggah foto. Coba lagi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 font-bold text-lg cursor-pointer transition-colors"
          title="Tutup"
        >
          ✕
        </button>

        <h3 className="text-base sm:text-lg font-black text-black mb-1">
          Bantu Tambah Data Produk Baru
        </h3>
        <p className="text-xs font-semibold text-gray-600 mb-3">
          Produk belum terdaftar di sistem. Unggah foto kemasan depan dan tabel gizi untuk ditambahkan oleh Admin.
        </p>

        {barcode && (
          <p className="text-xs font-mono font-bold text-gray-700 mb-4">
            Barcode: <span className="bg-yellow-200 px-2 py-0.5 rounded text-black font-mono">{barcode}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Foto Kemasan Depan */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-black">
              1. Foto Kemasan Depan (Wajah Produk)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
              className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#FFD027] file:font-black file:cursor-pointer hover:file:bg-amber-300"
            />
          </div>

          {/* 2. Foto Tabel Nilai Gizi Belakang */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-black">
              2. Foto Tabel Nilai Gizi (Belakang Kemasan)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNutritionFile(e.target.files?.[0] || null)}
              className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#00D084] file:font-black file:cursor-pointer hover:file:bg-emerald-300"
            />
          </div>

          {/* 3. Catatan / Nama Produk */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-black">
              Nama Produk / Catatan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Susu Kedelai V-Soy 300ml"
              className="w-full brutal-border-sm rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
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
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mengunggah...' : 'KIRIM DATA KE ADMIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

