'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import { CATALOG_CATEGORY_OPTIONS } from '@/lib/catalogCategories';

interface CatalogSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onSubmitSearch: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
}

export default function CatalogSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmitSearch,
  onClearSearch,
  isLoading = false,
}: CatalogSearchBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    if (dropdownOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  const currentCategory =
    CATALOG_CATEGORY_OPTIONS.find((c) => c.value === selectedCategory) || CATALOG_CATEGORY_OPTIONS[0];

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
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmitSearch();
              }
            }}
            placeholder="Cari produk OpenFoodFacts (nama atau barcode)..."
            className="w-full bg-white brutal-border brutal-shadow rounded-xl py-2.5 pl-4 pr-9 text-xs sm:text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          {searchQuery && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              title="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer p-1"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Yellow Search Action Button (#FFD027) */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onSubmitSearch}
          title="Cari Produk"
          className={`bg-[#FFD027] brutal-border brutal-shadow rounded-xl px-4 py-2.5 flex items-center justify-center brutal-btn cursor-pointer shrink-0 ${isLoading ? 'opacity-70 animate-pulse' : ''
            }`}
        >
          <Icons.Search className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Custom Neo-Brutalist Category Dropdown Selector */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`w-full sm:w-auto bg-white brutal-border brutal-shadow rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-black uppercase tracking-wider text-black brutal-btn cursor-pointer whitespace-nowrap transition-all ${dropdownOpen ? 'ring-2 ring-black' : ''
            }`}
          title="Pilih Kategori Produk"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-black shrink-0 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>{currentCategory.shortLabel}</span>
          </span>
          <svg
            className={`w-4 h-4 text-black shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
              }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Floating Category Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-full sm:w-60 z-50 bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 mb-1 border-b-2 border-black/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Pilih Kategori
              </span>
              <span className="text-[10px] font-mono font-black bg-[#FFD027] brutal-border-sm px-1.5 py-0.5 rounded text-black">
                {CATALOG_CATEGORY_OPTIONS.length} PILIHAN
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
              {CATALOG_CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      onCategoryChange(cat.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between brutal-btn cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                        : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Icons.Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
