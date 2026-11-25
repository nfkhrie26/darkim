'use client';

import { Icons } from '@/components/ui/Icons';

interface CatalogSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onSubmitSearch?: () => void;
}

export default function CatalogSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmitSearch,
}: CatalogSearchBarProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input Group */}
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitSearch?.();
            }}
            placeholder="Cari produk berdasarkan nama atau barcode..."
            className="w-full bg-white brutal-border brutal-shadow rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>

        {/* Yellow Search Action Button (#FFD027) */}
        <button
          type="button"
          onClick={onSubmitSearch}
          title="Cari Produk"
          className="bg-[#FFD027] brutal-border brutal-shadow rounded-xl px-4 py-2.5 flex items-center justify-center brutal-btn cursor-pointer shrink-0"
        >
          <Icons.Search className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* 3 Categories Filter Dropdown */}
      <div className="relative shrink-0">
        <div className="bg-white brutal-border brutal-shadow rounded-xl px-3 py-1 flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-transparent font-black text-xs sm:text-sm uppercase tracking-wider text-black focus:outline-none py-1.5 cursor-pointer"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="makanan">MAKANAN</option>
            <option value="minuman">MINUMAN</option>
          </select>
          {/* Funnel SVG Icon (Y) */}
          <svg className="w-4 h-4 text-black shrink-0 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

