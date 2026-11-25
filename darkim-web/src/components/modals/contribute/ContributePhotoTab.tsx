'use client';

import { useState } from 'react';

interface ContributePhotoTabProps {
  barcode: string;
  onSuccess: (msg: string) => void;
  onClose: () => void;
}

export default function ContributePhotoTab({
  barcode,
  onSuccess,
  onClose,
}: ContributePhotoTabProps) {
  const [photoDescription, setPhotoDescription] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [nutritionFile, setNutritionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile && !nutritionFile) {
      alert('Harap unggah minimal salah satu foto (kemasan depan atau tabel gizi).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode || 'MANUAL-CONTRIBUTE');
      if (photoDescription) formData.append('description', photoDescription);
      if (frontFile) formData.append('frontPhoto', frontFile);
      if (nutritionFile) formData.append('nutritionPhoto', nutritionFile);

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setFrontFile(null);
        setNutritionFile(null);
        setPhotoDescription('');
        onClose();
        onSuccess('Foto kemasan berhasil dikirim! Admin akan segera mengevaluasi data gizi.');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
      <div className="bg-blue-50 brutal-border-sm rounded-xl p-3 text-blue-950 font-medium">
        📷 <b>Cukup kirim foto:</b> Jika sedang terburu-buru, Anda cukup mengunggah foto kemasan depan dan tabel gizi. Admin yang akan mengekstrak nilainya.
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black uppercase text-black">
          1. Foto Kemasan Depan
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
          className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#FFD027] file:font-black file:cursor-pointer hover:file:bg-amber-300"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black uppercase text-black">
          2. Foto Tabel Nilai Gizi
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNutritionFile(e.target.files?.[0] || null)}
          className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#00D084] file:font-black file:cursor-pointer hover:file:bg-emerald-300"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black uppercase text-black">
          Catatan / Nama Produk (Opsional)
        </label>
        <input
          type="text"
          value={photoDescription}
          onChange={(e) => setPhotoDescription(e.target.value)}
          placeholder="Contoh: Susu Ultra Milk Cokelat 200ml"
          className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
        />
      </div>

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t-2 border-black/10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 font-bold text-gray-600 hover:text-black cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Mengunggah...' : 'Kirim Foto Kemasan'}
        </button>
      </div>
    </form>
  );
}
