'use client';

import { useState } from 'react';
import { TicketModel } from '@/types';
import OffFuzzySearchBox from './OffFuzzySearchBox';
import { Icons } from '@/components/ui/Icons';

interface TicketDetailModalProps {
  ticket: TicketModel | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export default function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onResolved,
}: TicketDetailModalProps) {
  const [resolutionMode, setResolutionMode] = useState<'OFF' | 'MANUAL'>('OFF');
  const [isResolving, setIsResolving] = useState(false);

  // Manual form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [servingSize, setServingSize] = useState('100 ml');
  const [energy, setEnergy] = useState('');
  const [carbs, setCarbs] = useState('');
  const [sugars, setSugars] = useState('');
  const [fiber, setFiber] = useState('');
  const [proteins, setProteins] = useState('');
  const [fat, setFat] = useState('');
  const [saturatedFat, setSaturatedFat] = useState('');
  const [sodium, setSodium] = useState('');
  const [salt, setSalt] = useState('');
  const [syncToOff, setSyncToOff] = useState(true);

  if (!isOpen || !ticket) return null;

  // Resolve via OpenFoodFacts Fuzzy Match
  const handleResolveOff = async (offBarcode: string) => {
    setIsResolving(true);
    try {
      const res = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          method: 'OFF_FUZZY',
          offBarcode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onResolved();
        onClose();
      } else {
        alert(data.message || 'Gagal menyelesaikan tiket.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsResolving(false);
    }
  };

  // Resolve via Manual Input
  const handleResolveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    setIsResolving(true);
    try {
      const res = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          method: 'MANUAL',
          manualData: {
            name: name.trim(),
            brand: brand.trim() || undefined,
            category: category.trim() || undefined,
            servingSize: servingSize.trim() || undefined,
            energy: energy ? Number(energy) : undefined,
            carbohydrates: carbs ? Number(carbs) : undefined,
            sugars: sugars ? Number(sugars) : undefined,
            fiber: fiber ? Number(fiber) : undefined,
            proteins: proteins ? Number(proteins) : undefined,
            fat: fat ? Number(fat) : undefined,
            saturatedFat: saturatedFat ? Number(saturatedFat) : undefined,
            sodium: sodium ? Number(sodium) : undefined,
            salt: salt ? Number(salt) : undefined,
            syncToOff,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onResolved();
        onClose();
      } else {
        alert(data.message || 'Gagal menyimpan input gizi manual.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-4xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 cursor-pointer transition-colors"
          title="Tutup"
        >
          <Icons.Close className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded text-xs font-black uppercase text-black">
            Tiket Masuk
          </span>
          <h2 className="text-lg font-black text-black">
            Resolusi Barcode: <span className="font-mono">{ticket.barcode}</span>
          </h2>
        </div>

        {/* User Description */}
        {ticket.description && (
          <div className="bg-gray-100 brutal-border-sm rounded-xl p-3 mb-4">
            <span className="text-[10px] font-black uppercase text-gray-500 block mb-0.5">Catatan Pengguna:</span>
            <p className="text-xs font-medium text-black">{ticket.description}</p>
          </div>
        )}

        {/* Photos Preview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 brutal-border-sm rounded-xl p-3 flex flex-col items-center">
            <span className="text-xs font-black text-black mb-2 uppercase">Foto Kemasan Depan</span>
            {ticket.frontPhoto ? (
              <img
                src={ticket.frontPhoto}
                alt="Foto Depan"
                className="max-h-48 object-contain rounded border border-black shadow-sm"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs font-bold text-gray-400">
                (Tidak ada foto depan)
              </div>
            )}
          </div>

          <div className="bg-gray-50 brutal-border-sm rounded-xl p-3 flex flex-col items-center">
            <span className="text-xs font-black text-black mb-2 uppercase">Foto Tabel Nilai Gizi</span>
            {ticket.nutritionPhoto ? (
              <img
                src={ticket.nutritionPhoto}
                alt="Foto Tabel Gizi"
                className="max-h-48 object-contain rounded border border-black shadow-sm"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs font-bold text-gray-400">
                (Tidak ada foto tabel gizi)
              </div>
            )}
          </div>
        </div>

        {/* Resolution Tabs */}
        <div className="border-t-2 border-black/15 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setResolutionMode('OFF')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase brutal-border-sm brutal-shadow-sm brutal-btn cursor-pointer ${
                resolutionMode === 'OFF' ? 'bg-[#00D084] text-black' : 'bg-white text-black'
              }`}
            >
              1. Fuzzy Search OpenFoodFacts
            </button>
            <button
              type="button"
              onClick={() => setResolutionMode('MANUAL')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase brutal-border-sm brutal-shadow-sm brutal-btn cursor-pointer ${
                resolutionMode === 'MANUAL' ? 'bg-[#FFD027] text-black' : 'bg-white text-black'
              }`}
            >
              2. Input Gizi Manual
            </button>
          </div>

          {resolutionMode === 'OFF' ? (
            <OffFuzzySearchBox
              initialQuery={ticket.description || ''}
              onSelectCandidate={handleResolveOff}
              isResolving={isResolving}
            />
          ) : (
            <form onSubmit={handleResolveManual} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-black block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Susu Ultra Milk Cokelat 250ml"
                  className="w-full brutal-border-sm rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Brand / Merek</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Ultrajaya"
                  className="w-full brutal-border-sm rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Takaran Saji (Serving Size)</label>
                <input
                  type="text"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  placeholder="Contoh: 100 ml atau 250 ml (1 botol)"
                  className="w-full brutal-border-sm rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Energi / Kalori (kkal)</label>
                <input
                  type="number"
                  step="any"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Karbohidrat Total (g)</label>
                <input
                  type="number"
                  step="any"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Gula Total (g)</label>
                <input
                  type="number"
                  step="any"
                  value={sugars}
                  onChange={(e) => setSugars(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Serat Pangan (g)</label>
                <input
                  type="number"
                  step="any"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="any"
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Lemak Total (g)</label>
                <input
                  type="number"
                  step="any"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Lemak Jenuh (g)</label>
                <input
                  type="number"
                  step="any"
                  value={saturatedFat}
                  onChange={(e) => setSaturatedFat(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Natrium (mg)</label>
                <input
                  type="number"
                  step="any"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Garam (g)</label>
                <input
                  type="number"
                  step="any"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>

              <div className="sm:col-span-2 bg-emerald-50 border-2 border-black/20 rounded-xl p-3 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="ticketSyncToOff"
                  checked={syncToOff}
                  onChange={(e) => setSyncToOff(e.target.checked)}
                  className="w-4 h-4 accent-[#00D084] cursor-pointer rounded"
                />
                <label htmlFor="ticketSyncToOff" className="font-bold text-black text-xs cursor-pointer select-none flex items-center gap-1.5">
                  <Icons.Globe className="w-3.5 h-3.5 text-black" />
                  <span>Kirim & Sinkronkan juga ke Open Food Facts</span>
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-bold text-gray-600 hover:text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2.5 font-black uppercase text-black brutal-btn cursor-pointer disabled:opacity-50"
                >
                  {isResolving ? 'Menyimpan...' : 'Simpan Produk & Selesaikan Tiket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

