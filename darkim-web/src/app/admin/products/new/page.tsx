'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import AdminHeader from '@/components/admin/AdminHeader';
import NutritionInputGrid from '@/components/admin/NutritionInputGrid';
import ServingSizeCalculator from '@/components/admin/ServingSizeCalculator';
import { useProductForm } from '@/hooks/useProductForm';

function NewProductForm() {
  const searchParams = useSearchParams();
  const {
    identity,
    nutrition,
    isSubmitting,
    errorMsg,
    setErrorMsg,
    updateIdentity,
    updateNutrition,
    submitForm,
  } = useProductForm({
    barcode: searchParams.get('barcode') || '',
    name: searchParams.get('name') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || 'Makanan & Minuman',
    servingSize: searchParams.get('servingSize') || '100 ml',
  });

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-[#E6F1EA]">
      <AdminHeader currentTab="products" />

      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-5">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-black brutal-btn hover:bg-gray-50"
          >
            <Icons.ArrowLeft className="w-4 h-4 text-black" />
            <span>Kembali ke Database Produk</span>
          </Link>
        </div>

        {errorMsg && (
          <div className="bg-red-100 brutal-border brutal-shadow-sm rounded-2xl p-4 text-xs font-bold text-red-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Icons.Alert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="font-black text-red-900 hover:text-black ml-2 cursor-pointer"
            >
              <Icons.Close className="w-4 h-4 text-red-900" />
            </button>
          </div>
        )}

        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8">
          <div className="border-b-2.5 border-black pb-5 mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#00D084] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
                Form Input Produk Baru
              </span>
              <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
                Direct to Open Food Facts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">Tambah Produk Baru</h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 leading-relaxed">
              Masukkan barcode, rincian produk, dan informasi nilai gizi (per 100g / 100ml). Data akan langsung disimpan dan disinkronkan ke server Open Food Facts.
            </p>
          </div>

          <form onSubmit={submitForm} className="flex flex-col gap-6">
            {/* Bagian 1: Identitas Produk */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-black">
                  Langkah 1
                </span>
                <h2 className="text-sm font-black uppercase text-black tracking-wide">
                  Identitas & Kemasan Produk
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-black text-xs block mb-1.5">
                    Barcode Produk (EAN-13 / UPC) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.barcode}
                    onChange={(e) => updateIdentity('barcode', e.target.value)}
                    placeholder="Contoh: 8992753000101"
                    className="w-full bg-white brutal-border-sm rounded-xl p-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-500 font-medium mt-1">
                    Nomor barcode angka yang tertera di kemasan produk.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-black text-xs block mb-1.5">
                    Nama Produk Lengkap <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.name}
                    onChange={(e) => updateIdentity('name', e.target.value)}
                    placeholder="Contoh: Susu Ultra Milk Rasa Cokelat 200ml"
                    className="w-full bg-white brutal-border-sm rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-500 font-medium mt-1">
                    Sertakan varian rasa dan ukuran agar mudah dikenali pengguna.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-black text-xs block mb-1.5">Brand / Merek</label>
                  <input
                    type="text"
                    value={identity.brand}
                    onChange={(e) => updateIdentity('brand', e.target.value)}
                    placeholder="Contoh: Ultrajaya"
                    className="w-full bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-black text-xs block mb-1.5">Kategori Produk</label>
                  <input
                    type="text"
                    value={identity.category}
                    onChange={(e) => updateIdentity('category', e.target.value)}
                    placeholder="Contoh: Susu UHT / Minuman Kemasan"
                    className="w-full bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-black text-xs block mb-1.5">Takaran Saji (Serving Size)</label>
                  <input
                    type="text"
                    value={identity.servingSize}
                    onChange={(e) => updateIdentity('servingSize', e.target.value)}
                    placeholder="Contoh: 100 ml atau 200 ml (2 sajian)"
                    className="w-full bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Panduan & Kalkulator Takaran Saji (Modular Component) */}
            <ServingSizeCalculator />

            {/* Bagian 3: Rincian Nilai Gizi (Modular Component) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#00D084] brutal-border-sm px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-black">
                    Langkah 2
                  </span>
                  <h2 className="text-sm font-black uppercase text-black tracking-wide">
                    Kandungan Nutrisi (per 100g / 100ml)
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Kosongkan jika tidak tercantum di kemasan</span>
              </div>

              <NutritionInputGrid values={nutrition} onChange={updateNutrition} disabled={isSubmitting} />
            </div>

            {/* Bagian 4: Integrasi Langsung ke Open Food Facts */}
            <div className="bg-[#00D084]/20 brutal-border brutal-shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
              <div className="bg-[#00D084] brutal-border-sm rounded-xl p-2.5 shrink-0">
                <Icons.Globe className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                  <span>Penyimpanan Terpusat ke Database Global Open Food Facts</span>
                  <span className="bg-[#00D084] text-black px-2 py-0.5 rounded text-[10px] font-black uppercase brutal-border-sm">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-950 mt-1 leading-relaxed">
                  Produk ini akan langsung tersimpan di server Open Food Facts dan otomatis dapat diakses oleh seluruh pengguna DARKIM tanpa memerlukan database perantara lokal.
                </p>
              </div>
            </div>

            {/* Bagian 5: Action Buttons */}
            <div className="border-t-2.5 border-black/10 pt-5 flex items-center justify-end gap-3">
              <Link
                href="/admin/products"
                className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 font-bold text-xs text-black hover:bg-gray-100 brutal-btn"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00D084] brutal-border brutal-shadow rounded-xl px-6 py-2.5 font-black uppercase tracking-wider text-xs text-black brutal-btn cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icons.Refresh className="w-4 h-4 animate-spin text-black" />
                    <span>Mengirim ke Open Food Facts...</span>
                  </>
                ) : (
                  <>
                    <Icons.Globe className="w-4 h-4 text-black" />
                    <span>Kirim ke Open Food Facts</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-gray-500">Memuat form produk...</div>}>
      <NewProductForm />
    </Suspense>
  );
}
