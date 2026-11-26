'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import CategorySelect from '@/components/ui/CategorySelect';
import ServingSizeInput from '@/components/ui/ServingSizeInput';
import NutritionInputGrid, { NutritionValues } from '@/components/admin/NutritionInputGrid';
import { getPer100ConversionFactor } from '@/lib/nutritionConversion';

interface ContributePhotoTabProps {
  barcode: string;
  initialName?: string;
  initialBrand?: string;
  initialCategory?: string;
  onSuccess: (msg: string) => void;
  onClose: () => void;
}

const EMPTY_NUTRITION: NutritionValues = {
  energy: '',
  carbohydrates: '',
  sugars: '',
  fat: '',
  saturatedFat: '',
  proteins: '',
  sodium: '',
  fiber: '',
};

export default function ContributePhotoTab({
  barcode,
  initialName,
  initialBrand,
  initialCategory,
  onSuccess,
  onClose,
}: ContributePhotoTabProps) {
  // Linear Wizard: Step 1 (Upload Photos) -> Step 2 (Fill Nutrition if no nutrition photo uploaded)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [nutritionFile, setNutritionFile] = useState<File | null>(null);
  const [nutritionPreview, setNutritionPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState('');

  // Step 2 required fields (when nutrition photo is not uploaded)
  const [name, setName] = useState(initialName || '');
  const [brand, setBrand] = useState(initialBrand || '');
  const [category, setCategory] = useState(initialCategory || '');
  const [servingSize, setServingSize] = useState('100 ml');
  const [nutrition, setNutrition] = useState<NutritionValues>(EMPTY_NUTRITION);

  const [loading, setLoading] = useState(false);

  // Sync initial props if they become available
  useEffect(() => {
    if (initialName && !name) setName(initialName);
    if (initialBrand && !brand) setBrand(initialBrand);
    if (initialCategory && !category) setCategory(initialCategory);
  }, [initialName, initialBrand, initialCategory]);

  const updateNutrition = (field: keyof NutritionValues, value: string) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  const { servingAmount, factor, isScaled } = getPer100ConversionFactor(servingSize);
  const dynamicPerLabel = servingSize.trim() ? `per ${servingSize.trim()}` : 'per 100g / 100ml';

  const handleFrontChange = (file: File | null) => {
    setFrontFile(file);
    setFrontPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleNutritionPhotoChange = (file: File | null) => {
    setNutritionFile(file);
    setNutritionPreview(file ? URL.createObjectURL(file) : null);
  };

  const submitFormData = async (includeManualNutrition: boolean) => {
    if (!frontFile) {
      alert('Foto produk (kemasan depan) wajib diunggah.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode || 'MANUAL-CONTRIBUTE');
      formData.append('frontPhoto', frontFile);
      if (nutritionFile) formData.append('nutritionPhoto', nutritionFile);
      if (photoDescription.trim()) formData.append('description', photoDescription.trim());

      if (includeManualNutrition) {
        const manualData = {
          name: name.trim(),
          brand: brand.trim(),
          category: category.trim(),
          servingSize: servingSize.trim(),
          energy: Number(nutrition.energy),
          carbohydrates: Number(nutrition.carbohydrates),
          sugars: Number(nutrition.sugars),
          fat: Number(nutrition.fat),
          saturatedFat: Number(nutrition.saturatedFat),
          proteins: Number(nutrition.proteins),
          sodium: Number(nutrition.sodium),
          fiber: Number(nutrition.fiber),
        };
        formData.append('manualData', JSON.stringify(manualData));
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        onClose();
        onSuccess(
          includeManualNutrition
            ? 'Foto produk dan informasi gizi berhasil dikirim untuk diverifikasi admin!'
            : 'Bukti foto kemasan & tabel gizi berhasil dikirim! Admin akan segera mengevaluasi.'
        );
      } else {
        alert('Gagal mengirim bukti kontribusi. Silakan coba lagi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 Handler: If nutrition photo exists -> finish; otherwise advance to Step 2
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile) {
      alert('Foto produk (kemasan depan) wajib diunggah.');
      return;
    }

    if (nutritionFile) {
      await submitFormData(false);
    } else {
      setWizardStep(2);
    }
  };

  // Step 2 Handler: Validate all required nutrition fields and submit together with front photo
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !category.trim() || !servingSize.trim()) {
      alert('Semua field identitas produk dan kategori wajib diisi.');
      return;
    }
    await submitFormData(true);
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Linear Wizard Progress Bar */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 py-1.5 px-3 rounded-lg brutal-border-sm font-black uppercase text-[10px] tracking-wider text-center ${
            wizardStep === 1 ? 'bg-[#FFD027] text-black' : 'bg-[#00D084] text-black'
          }`}
        >
          1. Unggah Foto Bukti
        </div>
        <span className="font-black text-black">&rarr;</span>
        <div
          className={`flex-1 py-1.5 px-3 rounded-lg brutal-border-sm font-black uppercase text-[10px] tracking-wider text-center ${
            wizardStep === 2
              ? 'bg-[#FFD027] text-black'
              : nutritionFile
              ? 'bg-gray-100 text-gray-400 line-through'
              : 'bg-white text-gray-600'
          }`}
        >
          2. Isi Nilai Gizi {nutritionFile ? '(Opsional)' : '(Jika tanpa foto gizi)'}
        </div>
      </div>

      {wizardStep === 1 ? (
        <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
          {/* 1. Foto Produk (WAJIB) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-black">
              1. Foto Produk / Kemasan Depan <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              required={!frontFile}
              onChange={(e) => handleFrontChange(e.target.files?.[0] || null)}
              className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#FFD027] file:font-black file:cursor-pointer hover:file:bg-amber-300"
            />
            {frontPreview && (
              <div className="mt-1 w-28 h-28 rounded-xl brutal-border-sm overflow-hidden bg-white p-1">
                <img src={frontPreview} alt="Pratinjau Produk" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* 2. Foto Tabel Nilai Gizi (OPSIONAL) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black uppercase text-black">
                2. Foto Tabel Info Gizi <span className="text-gray-500 font-bold normal-case">(Opsional)</span>
              </label>
              {nutritionFile && (
                <button
                  type="button"
                  onClick={() => handleNutritionPhotoChange(null)}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Hapus foto gizi
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleNutritionPhotoChange(e.target.files?.[0] || null)}
              className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-[#00D084] file:font-black file:cursor-pointer hover:file:bg-emerald-300"
            />
            {nutritionPreview && (
              <div className="mt-1 w-28 h-28 rounded-xl brutal-border-sm overflow-hidden bg-white p-1">
                <img src={nutritionPreview} alt="Pratinjau Tabel Gizi" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-black">
              Catatan Tambahan <span className="text-gray-500 font-bold normal-case">(Opsional)</span>
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
              {loading
                ? 'Mengunggah...'
                : nutritionFile
                ? 'Kirim Bukti Foto'
                : 'Lanjut Isi Nilai Gizi →'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="flex flex-col gap-3.5">
          <div>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 cursor-pointer mb-1"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5 text-black" />
              <span>Kembali ke Unggah Foto</span>
            </button>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-black block mb-1">
                Brand / Merek <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Contoh: Ultrajaya"
                className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="font-bold text-black block mb-1">
                Kategori Produk <span className="text-red-600">*</span>
              </label>
              <CategorySelect value={category} onChange={setCategory} required disabled={loading} />
            </div>

            <div>
              <label className="font-bold text-black block mb-1">
                Takaran Saji <span className="text-red-600">*</span>
              </label>
              <ServingSizeInput
                value={servingSize}
                onChange={setServingSize}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Rincian Nutrisi Grid (Dinamis per x gram/ml & Wajib diisi) */}
          <div className="border-t-2 border-black/10 pt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="font-black text-xs uppercase text-black block">
                Rincian Nilai Gizi ({dynamicPerLabel})
              </label>
              {isScaled && servingAmount && (
                <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black text-black">
                  Auto-konversi ke 100g/ml (&times;{factor.toFixed(2)})
                </span>
              )}
            </div>

            <NutritionInputGrid
              values={nutrition}
              onChange={updateNutrition}
              disabled={loading}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-4 py-2 font-bold text-gray-600 hover:text-black cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 font-black uppercase tracking-wider text-black brutal-btn cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mengirim Data...' : 'Kirim Foto & Data Gizi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
