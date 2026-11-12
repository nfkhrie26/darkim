'use client';

import { useState } from 'react';

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
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama produk untuk mencari di OpenFoodFacts..."
          className="flex-1 brutal-border-sm rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FFD027] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer shrink-0 disabled:opacity-50"
        >
          {loading ? 'Mencari...' : 'Cari OFF'}
        </button>
      </form>

      {/* Results List */}
      <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
        {results.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-white brutal-border-sm rounded-xl flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-md border border-black shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 border border-black rounded-md flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                  OFF
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-black text-black truncate">{item.name}</p>
                <p className="text-[11px] text-gray-500 font-medium truncate">
                  {item.brand} • Barcode OFF: {item.barcode}
                </p>
                <p className="text-[10px] font-bold text-gray-700">
                  Energi: {item.energy ?? 0} kkal | Gula: {item.sugars ?? 0}g | Natrium: {item.sodium ?? 0}mg
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isResolving}
              onClick={() => onSelectCandidate(item.barcode)}
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-3 py-1.5 text-[11px] font-black uppercase text-black brutal-btn shrink-0 cursor-pointer disabled:opacity-50"
            >
              Import & Tautkan
            </button>
          </div>
        ))}

        {hasSearched && results.length === 0 && !loading && (
          <p className="text-xs text-center font-bold text-gray-500 py-4">
            Tidak ditemukan produk di OpenFoodFacts dengan kata kunci &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}

