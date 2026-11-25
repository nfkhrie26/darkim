'use client';

import { useState } from 'react';

interface ContributeManualTabProps {
  barcode: string;
  onSuccess: (msg: string) => void;
  onClose: () => void;
}

export default function ContributeManualTab({
  barcode,
  onSuccess,
  onClose,
}: ContributeManualTabProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [servingSize, setServingSize] = useState('100 ml');
  const [energy, setEnergy] = useState('');
  const [carbs, setCarbs] = useState('');
  const [sugars, setSugars] = useState('');
  const [fat, setFat] = useState('');
  const [saturatedFat, setSaturatedFat] = useState('');
  const [proteins, setProteins] = useState('');
  const [sodium, setSodium] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualPhotoFile, setManualPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode || 'MANUAL-CONTRIBUTE');
      if (manualNote) formData.append('description', manualNote);
      if (manualPhotoFile) formData.append('nutritionPhoto', manualPhotoFile);

      const manualData = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        category: category.trim() || undefined,
        servingSize: servingSize.trim() || undefined,
        energy: energy ? Number(energy) : undefined,
        carbohydrates: carbs ? Number(carbs) : undefined,
        sugars: sugars ? Number(sugars) : undefined,
        fat: fat ? Number(fat) : undefined,
        saturatedFat: saturatedFat ? Number(saturatedFat) : undefined,
        proteins: proteins ? Number(proteins) : undefined,
        sodium: sodium ? Number(sodium) : undefined,
      };

      formData.append('manualData', JSON.stringify(manualData));

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setName('');
        setBrand('');
        setServingSize('100 ml');
        setEnergy('');
        setCarbs('');
        setSugars('');
        setFat('');
        setSaturatedFat('');
        setProteins('');
        setSodium('');
        setManualNote('');
        setManualPhotoFile(null);
        onClose();
        onSuccess('Data gizi berhasil dikirim! Admin akan segera meninjau dan menyetujui (ACC).');
      } else {
        alert('Gagal mengirim data gizi. Silakan coba lagi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
      <div className="bg-[#FFFBEB] brutal-border-sm rounded-xl p-3 text-amber-950 font-medium leading-relaxed">
        💡 <b>Ketik langsung nilai gizi:</b> Masukkan angka per 100g/100ml (atau per sajian jika takaran saji kemasan 100ml). Data akan dikirim ke antrean agar admin tinggal <b>menyetujui (ACC)</b>.
      </div>

      <div>
        <label className="font-bold text-black block mb-1">
          Nama Produk Lengkap <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Susu Ultra Milk Rasa Cokelat 200ml"
          className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-black block mb-1">Brand / Merek</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Contoh: Ultrajaya"
            className="w-full bg-white brutal-border-sm rounded-xl p-2 font-medium focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="font-bold text-black block mb-1">Takaran Saji (Serving Size)</label>
          <input
            type="text"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            placeholder="Contoh: 100 ml atau 250 ml (1 botol)"
            className="w-full bg-white brutal-border-sm rounded-xl p-2 font-medium focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Rincian Nutrisi Grid */}
      <div className="border-t-2 border-black/10 pt-2">
        <label className="font-black text-xs uppercase text-black block mb-2">
          Rincian Nilai Gizi (per 100g / 100ml)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-gray-50 brutal-border-sm rounded-xl p-2">
            <label className="font-bold text-black text-[11px] block mb-0.5">Energi (kkal)</label>
            <input
              type="number"
              step="any"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              placeholder="80"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-amber-50/70 brutal-border-sm rounded-xl p-2">
            <label className="font-black text-amber-950 text-[11px] block mb-0.5">Gula Total (g)</label>
            <input
              type="number"
              step="any"
              value={sugars}
              onChange={(e) => setSugars(e.target.value)}
              placeholder="9"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-gray-50 brutal-border-sm rounded-xl p-2">
            <label className="font-bold text-black text-[11px] block mb-0.5">Karbohidrat (g)</label>
            <input
              type="number"
              step="any"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="12"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-gray-50 brutal-border-sm rounded-xl p-2">
            <label className="font-bold text-black text-[11px] block mb-0.5">Lemak Total (g)</label>
            <input
              type="number"
              step="any"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="3"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-rose-50/70 brutal-border-sm rounded-xl p-2">
            <label className="font-black text-rose-950 text-[11px] block mb-0.5">Lemak Jenuh (g)</label>
            <input
              type="number"
              step="any"
              value={saturatedFat}
              onChange={(e) => setSaturatedFat(e.target.value)}
              placeholder="1.5"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-rose-50/70 brutal-border-sm rounded-xl p-2">
            <label className="font-black text-rose-950 text-[11px] block mb-0.5">Natrium (mg)</label>
            <input
              type="number"
              step="any"
              value={sodium}
              onChange={(e) => setSodium(e.target.value)}
              placeholder="45"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-gray-50 brutal-border-sm rounded-xl p-2 col-span-2 sm:col-span-1">
            <label className="font-bold text-black text-[11px] block mb-0.5">Protein (g)</label>
            <input
              type="number"
              step="any"
              value={proteins}
              onChange={(e) => setProteins(e.target.value)}
              placeholder="3"
              className="w-full bg-white brutal-border-sm rounded-lg p-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Lampiran Foto Opsional sebagai bukti verifikasi */}
      <div className="flex flex-col gap-1 border-t-2 border-black/10 pt-2">
        <label className="font-bold text-gray-800 text-[11px] block">
          Lampirkan Foto Kemasan / Tabel Gizi (Opsional, untuk verifikasi admin)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setManualPhotoFile(e.target.files?.[0] || null)}
          className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-gray-100 file:font-black file:cursor-pointer hover:file:bg-gray-200"
        />
      </div>

      <div className="flex justify-end gap-2 mt-3 pt-2 border-t-2 border-black/10">
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
          className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {loading ? 'Mengirim Data...' : 'Kirim Data Gizi untuk Di-ACC'}
        </button>
      </div>
    </form>
  );
}
