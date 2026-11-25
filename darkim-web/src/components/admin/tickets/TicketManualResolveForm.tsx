'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import NutritionInputGrid, { NutritionValues } from '@/components/admin/NutritionInputGrid';

interface TicketManualResolveFormProps {
  name: string;
  setName: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  servingSize: string;
  setServingSize: (v: string) => void;
  nutrition: NutritionValues;
  updateNutrition: (field: keyof NutritionValues, value: string) => void;
  isUserPrefilled: boolean;
  isResolving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TicketManualResolveForm({
  name,
  setName,
  brand,
  setBrand,
  category,
  setCategory,
  servingSize,
  setServingSize,
  nutrition,
  updateNutrition,
  isUserPrefilled,
  isResolving,
  onSubmit,
}: TicketManualResolveFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
      {/* Banner Input Mandiri Pengguna */}
      {isUserPrefilled && (
        <div className="bg-[#00D084]/20 brutal-border brutal-shadow-sm rounded-2xl p-4 flex items-start gap-3.5 animate-in fade-in">
          <div className="bg-[#00D084] brutal-border-sm rounded-xl p-2 shrink-0 mt-0.5">
            <Icons.Check className="w-4 h-4 text-black" />
          </div>
          <div className="flex-1 text-xs text-emerald-950">
            <div className="font-black text-sm text-black flex items-center gap-2 flex-wrap">
              <span>Data Gizi Diinput Mandiri oleh Pengguna</span>
              <span className="bg-[#00D084] text-black px-2 py-0.5 rounded text-[10px] font-black uppercase brutal-border-sm">
                Siap di-ACC
              </span>
            </div>
            <p className="mt-1 font-medium leading-relaxed text-black/80">
              Pengguna telah membaca dan menginput rincian gizi produk ini secara mandiri. Silakan verifikasi nilai di bawah (cocokkan dengan foto kemasan jika terlampir), lalu klik tombol <b>Setujui (ACC) & Kirim ke Open Food Facts</b>.
            </p>
          </div>
        </div>
      )}

      {/* Identitas Produk */}
      <div>
        <label className="font-bold text-black block mb-1.5">Nama Produk *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Susu Ultra Milk Cokelat 250ml"
          className="w-full bg-white brutal-border-sm rounded-xl p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="font-bold text-black block mb-1">Brand / Merek</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Contoh: Ultrajaya"
            className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="font-bold text-black block mb-1">Kategori</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="font-bold text-black block mb-1">Takaran Saji (Serving Size)</label>
          <input
            type="text"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            placeholder="Contoh: 100 ml atau 250 ml (1 botol)"
            className="w-full bg-white brutal-border-sm rounded-xl p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Panduan Gizi */}
      <div className="bg-[#FFFBEB] brutal-border brutal-shadow-sm rounded-2xl p-4 text-xs text-amber-950 font-medium flex items-start gap-3">
        <span className="text-lg select-none">💡</span>
        <div className="leading-relaxed">
          <span className="font-black text-black">Panduan Pengisian:</span> Masukkan angka gizi basis <b>per 100g / 100ml</b>. Jika takaran saji kemasan adalah 100ml (misal: susu 200ml takaran saji 100ml energi 80 kkal), masukkan langsung angka <b>80</b> kkal.
        </div>
      </div>

      {/* Reusable Nutrition Grid */}
      <div className="flex flex-col gap-2">
        <label className="font-black uppercase tracking-wider text-black text-xs">
          Rincian Nilai Gizi (per 100g / 100ml)
        </label>
        <NutritionInputGrid values={nutrition} onChange={updateNutrition} disabled={isResolving} />
      </div>

      {/* Sinkronisasi OFF */}
      <div className="bg-[#00D084]/20 brutal-border brutal-shadow-sm rounded-xl p-3.5 flex items-center gap-2.5">
        <Icons.Globe className="w-4 h-4 text-black shrink-0" />
        <span className="font-bold text-black text-xs leading-relaxed">
          Resolusi ini langsung dikirim dan disimpan ke server global Open Food Facts.
        </span>
      </div>

      {/* Tombol Aksi */}
      <div className="border-t-2.5 border-black/10 pt-4 flex items-center justify-end gap-3 mt-2">
        <Link
          href="/admin/tickets"
          className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 font-bold text-xs text-black hover:bg-gray-100 brutal-btn"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isResolving}
          className="bg-[#00D084] brutal-border brutal-shadow rounded-xl px-5 py-2.5 font-black uppercase tracking-wider text-black text-xs brutal-btn cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isResolving ? (
            <>
              <Icons.Refresh className="w-4 h-4 animate-spin text-black" />
              <span>Memproses...</span>
            </>
          ) : isUserPrefilled ? (
            <>
              <Icons.Check className="w-4 h-4 text-black" />
              <span>Setujui (ACC) & Kirim ke Open Food Facts</span>
            </>
          ) : (
            <>
              <Icons.Globe className="w-4 h-4 text-black" />
              <span>Kirim & Selesaikan ke Open Food Facts</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
