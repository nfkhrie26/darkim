'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import CategorySelect from '@/components/ui/CategorySelect';
import ServingSizeInput from '@/components/ui/ServingSizeInput';
import NutritionInputGrid, { NutritionValues } from '@/components/admin/NutritionInputGrid';

interface ContributePhotoTabProps {
  barcode: string;
  initialName?: string;
  initialBrand?: string;
  initialCategory?: string;
  isNewProduct?: boolean;
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

/**
 * ContributePhotoTab
 * Mekanisme Laporan & Pelengkapan Data Gizi:
 * 1. Jika produk TIDAK ADA di OFF (isNew):
 *    - Foto Kemasan Depan: WAJIB
 *    - Foto Informasi Nilai Gizi: WAJIB
 *    - Identitas Produk (Nama & Kategori): WAJIB
 * 2. Jika MEMPERBAIKI data gizi produk yang SUDAH ADA (!isNew):
 *    - Foto Kemasan Depan: OPSIONAL
 *    - Foto Informasi Nilai Gizi: WAJIB
 */
export default function ContributePhotoTab({
  barcode,
  initialName,
  initialBrand,
  initialCategory,
  isNewProduct,
  onSuccess,
  onClose,
}: ContributePhotoTabProps) {
  // Tentukan apakah produk baru (tidak ada di OFF) atau koreksi data gizi produk yang sudah ada
  const isNew =
    isNewProduct ?? (!initialName || initialName.trim() === '' || initialName === 'Produk Tanpa Nama');

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [nutritionFile, setNutritionFile] = useState<File | null>(null);
  const [nutritionPreview, setNutritionPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState('');

  // Identitas produk (wajib diisi jika produk baru belum terdaftar di database OFF)
  const [name, setName] = useState(initialName || '');
  const [brand, setBrand] = useState(initialBrand || '');
  const [category, setCategory] = useState(initialCategory || 'Makanan Kemasan');

  // Input nilai gizi manual opsional (drawer)
  const [showManualNutrition, setShowManualNutrition] = useState(false);
  const [servingSize, setServingSize] = useState('100 ml');
  const [nutrition, setNutrition] = useState<NutritionValues>(EMPTY_NUTRITION);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sinkronisasi data prop
  useEffect(() => {
    if (initialName && !name) setName(initialName);
    if (initialBrand && !brand) setBrand(initialBrand);
    if (initialCategory && !category) setCategory(initialCategory);
  }, [initialName, initialBrand, initialCategory]);

  const updateNutrition = (field: keyof NutritionValues, value: string) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  const handleFrontChange = (file: File | null) => {
    setFrontFile(file);
    setFrontPreview(file ? URL.createObjectURL(file) : null);
    if (file) setValidationError(null);
  };

  const handleNutritionChange = (file: File | null) => {
    setNutritionFile(file);
    setNutritionPreview(file ? URL.createObjectURL(file) : null);
    if (file) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validasi aturan laporan:
    if (isNew) {
      if (!frontFile) {
        setValidationError('Produk baru belum ada di OFF: Foto kemasan depan produk wajib dicantumkan.');
        return;
      }
      if (!nutritionFile) {
        setValidationError('Produk baru belum ada di OFF: Foto tabel informasi nilai gizi wajib dicantumkan.');
        return;
      }
      if (!name.trim()) {
        setValidationError('Nama produk wajib diisi.');
        return;
      }
    } else {
      if (!nutritionFile) {
        setValidationError('Perbaikan data gizi: Foto tabel informasi nilai gizi wajib dicantumkan.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode || 'MANUAL-CONTRIBUTE');
      if (frontFile) formData.append('frontPhoto', frontFile);
      if (nutritionFile) formData.append('nutritionPhoto', nutritionFile);

      // Siapkan catatan dan metadata
      const userNotes = photoDescription.trim();
      const reportContext = isNew ? '[Produk Baru OFF]' : '[Perbaikan Data Gizi]';
      const productNameText = name.trim() || initialName || 'Produk Tanpa Nama';

      if (showManualNutrition && (nutrition.energy || nutrition.carbohydrates || nutrition.sugars)) {
        const manualData = {
          name: productNameText,
          brand: brand.trim(),
          category: category.trim(),
          servingSize: servingSize.trim(),
          energy: Number(nutrition.energy) || null,
          carbohydrates: Number(nutrition.carbohydrates) || null,
          sugars: Number(nutrition.sugars) || null,
          fat: Number(nutrition.fat) || null,
          saturatedFat: Number(nutrition.saturatedFat) || null,
          proteins: Number(nutrition.proteins) || null,
          sodium: Number(nutrition.sodium) || null,
          fiber: Number(nutrition.fiber) || null,
          userNote: `${reportContext} ${userNotes}`.trim(),
        };
        formData.append('manualData', JSON.stringify(manualData));
      } else {
        const descriptionHeader = `${reportContext} [${productNameText}]`;
        formData.append('description', `${descriptionHeader} ${userNotes}`.trim());
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        onClose();
        onSuccess(
          isNew
            ? 'Laporan produk baru dan foto informasi gizi berhasil dikirim ke Admin!'
            : 'Foto bukti informasi gizi berhasil dikirim! Admin akan segera mengevaluasi perbaikan data.'
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        setValidationError(errJson.message || 'Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch {
      setValidationError('Terjadi kesalahan koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah tombol submit siap ditekan
  const isSubmitDisabled = loading || (isNew ? !frontFile || !nutritionFile || !name.trim() : !nutritionFile);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
      {/* 1. Petunjuk Mekanisme Sesuai Status Produk */}
      {isNew ? (
        <div className="bg-amber-50 brutal-border-sm rounded-xl p-3.5 flex items-start gap-2.5">
          <Icons.Alert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs text-amber-950 font-semibold leading-relaxed">
            <span className="font-black text-amber-900 uppercase tracking-tight">
              Produk Belum Terdaftar di OFF
            </span>
            <p>
              Karena produk ini belum terdaftar di Open Food Facts, Anda{' '}
              <strong>wajib mencantumkan Foto Kemasan Depan</strong> dan{' '}
              <strong>Foto Informasi Nilai Gizi</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 brutal-border-sm rounded-xl p-3.5 flex items-start gap-2.5">
          <Icons.Check className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs text-emerald-950 font-semibold leading-relaxed">
            <span className="font-black text-emerald-900 uppercase tracking-tight">
              Perbaikan Data Gizi Produk Terdaftar
            </span>
            <p>
              Produk sudah terdaftar di Open Food Facts. Anda{' '}
              <strong>wajib mencantumkan Foto Informasi Nilai Gizi</strong> untuk verifikasi perbaikan.{' '}
              Foto kemasan depan bersifat <strong>opsional</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Pesan Kesalahan Validasi */}
      {validationError && (
        <div className="bg-red-50 brutal-border-sm rounded-xl p-3 text-red-600 font-bold flex items-center gap-2">
          <Icons.Close className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. Form Identitas Produk (Wajib untuk Produk Baru, Ringkasan untuk Produk Terdaftar) */}
      {isNew ? (
        <div className="bg-white brutal-border-sm rounded-xl p-3.5 flex flex-col gap-3">
          <span className="text-[11px] font-black uppercase text-gray-700 border-b border-black/10 pb-1.5">
            Identitas Produk Baru
          </span>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase text-black">
                Nama Produk <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Biskuit Cokelat Kelapa"
                className="w-full bg-white brutal-border-sm rounded-lg py-2 px-3 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="w-full sm:w-1/3 flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase text-black">Merek / Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Cth: Roma"
                className="w-full bg-white brutal-border-sm rounded-lg py-2 px-3 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase text-black">
              Kategori Produk <span className="text-red-600">*</span>
            </label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>
        </div>
      ) : (
        name && (
          <div className="bg-gray-50 brutal-border-sm rounded-xl p-3 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                Target Produk Terdaftar:
              </span>
              <span className="text-xs font-black text-black">
                {name} {brand ? `(${brand})` : ''}
              </span>
            </div>
            {barcode && (
              <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded font-mono text-[11px] font-bold text-black shrink-0">
                {barcode}
              </span>
            )}
          </div>
        )
      )}

      {/* 3. Slot Unggah Foto (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Foto 1: Kemasan Depan (Wajib jika Produk Baru, Opsional jika Perbaikan) */}
        <div
          className={`bg-white brutal-border-sm rounded-xl p-3.5 flex flex-col gap-2 ${
            isNew && !frontFile ? 'border-amber-400 ring-1 ring-amber-400' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <label className="text-xs font-black uppercase text-black flex items-center gap-1">
              <span>Foto Depan Produk</span>
              {isNew ? (
                <span className="text-red-600 font-black">* (Wajib)</span>
              ) : (
                <span className="text-gray-500 font-bold normal-case text-[11px]">(Opsional)</span>
              )}
            </label>
            {frontFile && (
              <button
                type="button"
                onClick={() => handleFrontChange(null)}
                className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-500 leading-tight">
            {isNew
              ? 'Wajib untuk identifikasi wujud fisik produk baru.'
              : 'Opsional, foto produk sudah ada pada database.'}
          </p>

          <input
            type="file"
            accept="image/*"
            required={isNew && !frontFile}
            onChange={(e) => handleFrontChange(e.target.files?.[0] || null)}
            className="text-[11px] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-2 file:border-black file:bg-[#FFD027] file:font-black file:cursor-pointer hover:file:bg-amber-300 w-full"
          />

          {frontPreview && (
            <div className="mt-1 w-full aspect-video max-h-36 rounded-lg brutal-border-sm overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
              <img src={frontPreview} alt="Kemasan Depan" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Foto 2: Tabel Informasi Nilai Gizi (SELALU WAJIB) */}
        <div
          className={`bg-white brutal-border-sm rounded-xl p-3.5 flex flex-col gap-2 ${
            !nutritionFile ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <label className="text-xs font-black uppercase text-black flex items-center gap-1">
              <span>Foto Tabel Info Gizi</span>
              <span className="text-red-600 font-black">* (Wajib)</span>
            </label>
            {nutritionFile && (
              <button
                type="button"
                onClick={() => handleNutritionChange(null)}
                className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-500 leading-tight">
            Wajib difoto dengan jelas untuk verifikasi kandungan gizi oleh admin.
          </p>

          <input
            type="file"
            accept="image/*"
            required={!nutritionFile}
            onChange={(e) => handleNutritionChange(e.target.files?.[0] || null)}
            className="text-[11px] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-2 file:border-black file:bg-[#00D084] file:font-black file:cursor-pointer hover:file:bg-emerald-400 w-full"
          />

          {nutritionPreview && (
            <div className="mt-1 w-full aspect-video max-h-36 rounded-lg brutal-border-sm overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
              <img src={nutritionPreview} alt="Tabel Gizi" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* 4. Catatan Tambahan (Opsional) */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-black uppercase text-black">Catatan Tambahan (Opsional)</label>
        <textarea
          rows={2}
          value={photoDescription}
          onChange={(e) => setPhotoDescription(e.target.value)}
          placeholder={
            isNew
              ? 'Cth: Kemasan varian rasa vanila 250 gram...'
              : 'Cth: Nilai gula pada kemasan fisik terbaru adalah 8 gram, bukan 15 gram...'
          }
          className="w-full bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 resize-none"
        />
      </div>

      {/* 5. Input Nilai Gizi Manual (Drawer Opsional) */}
      <div className="border-t-2 border-black/10 pt-2">
        <button
          type="button"
          onClick={() => setShowManualNutrition(!showManualNutrition)}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-gray-700 hover:text-black cursor-pointer group"
        >
          <span className="w-4 h-4 rounded bg-[#FFD027] brutal-border-sm text-black flex items-center justify-center text-[11px] group-hover:scale-105">
            {showManualNutrition ? '−' : '+'}
          </span>
          <span>{showManualNutrition ? 'Sembunyikan Rincian Angka Gizi' : 'Bantu Ketik Rincian Angka Gizi (Opsional)'}</span>
        </button>

        {showManualNutrition && (
          <div className="mt-3 p-3.5 bg-gray-50 brutal-border-sm rounded-xl flex flex-col gap-3 animate-in fade-in duration-150">
            <p className="text-[11px] font-semibold text-gray-600">
              Jika tabel gizi pada foto mudah dibaca, Anda dapat membantu mempercepat proses approval dengan mengetikkan nilainya di bawah ini:
            </p>

            <ServingSizeInput value={servingSize} onChange={setServingSize} />

            <NutritionInputGrid
              values={nutrition}
              onChange={updateNutrition}
            />
          </div>
        )}
      </div>

      {/* 6. Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-black/10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black brutal-border-sm brutal-shadow-sm brutal-btn cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
            isNew ? 'bg-[#FFD027] hover:bg-amber-300' : 'bg-[#00D084] hover:bg-emerald-400'
          }`}
        >
          {loading ? (
            <span>Mengirim Bukti...</span>
          ) : (
            <>
              <Icons.Check className="w-4 h-4 text-black" />
              <span>{isNew ? 'Kirim Data Produk Baru' : 'Kirim Perbaikan Data Gizi'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
