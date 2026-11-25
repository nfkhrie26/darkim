'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';

interface OffCandidate {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  energy?: number;
  carbohydrates?: number;
  sugars?: number;
  sodium?: number;
  image?: string;
}

interface OffFuzzySearchBoxProps {
  initialQuery?: string;
  onSelectCandidate: (candidateBarcode: string) => void;
  isResolving?: boolean;
}

export default function OffFuzzySearchBox({
  initialQuery = '',
  onSelectCandidate,
  isResolving = false,
}: OffFuzzySearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OffCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/admin/off-search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.products || []);
      }
    } catch {
      alert('Gagal menghubungi OpenFoodFacts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama produk untuk mencari di OpenFoodFacts..."
          className="flex-1 bg-white brutal-border-sm rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FFD027] brutal-border brutal-shadow-sm rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer shrink-0 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <Icons.Refresh className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Icons.Search className="w-3.5 h-3.5 text-black" />
              <span>Cari OFF</span>
            </>
          )}
        </button>
      </form>

      {/* Results List */}
      <div className="max-h-80 overflow-y-auto flex flex-col gap-2.5 pr-1">
        {results.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-white brutal-border-sm brutal-shadow-sm rounded-xl flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg brutal-border-sm shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 brutal-border-sm rounded-lg flex items-center justify-center text-[10px] font-black text-gray-700 shrink-0">
                  OFF
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-black text-black truncate">{item.name}</p>
                <p className="text-[11px] text-gray-600 font-medium truncate mt-0.5">
                  {item.brand || 'Tanpa Brand'} • Barcode: <span className="font-mono font-bold text-black">{item.barcode}</span>
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-gray-100 brutal-border-sm px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-black">
                    Kalori: {item.energy ?? 0} kkal
                  </span>
                  <span className="bg-amber-100 brutal-border-sm px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-black">
                    Gula: {item.sugars ?? 0}g
                  </span>
                  <span className="bg-rose-100 brutal-border-sm px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-black">
                    Natrium: {item.sodium ?? 0}mg
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isResolving}
              onClick={() => onSelectCandidate(item.barcode)}
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-black brutal-btn shrink-0 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Icons.Check className="w-3.5 h-3.5 text-black" />
              <span>Import & Tautkan</span>
            </button>
          </div>
        ))}

        {hasSearched && results.length === 0 && !loading && (
          <div className="p-6 text-center bg-gray-50 brutal-border-sm rounded-xl">
            <p className="text-xs font-bold text-gray-600">
              Tidak ditemukan produk di OpenFoodFacts dengan kata kunci &quot;{query}&quot;.
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Gunakan mode <b>Input Gizi Manual</b> untuk memasukkan data produk baru secara langsung.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
