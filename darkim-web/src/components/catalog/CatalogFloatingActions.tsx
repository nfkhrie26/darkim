'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';
import { CATALOG_CATEGORY_OPTIONS, CATEGORY_LABELS_MAP } from '@/lib/catalogCategories';

interface CatalogFloatingActionsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onSubmitSearch: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
  onBackToTop?: () => void;
}

export default function CatalogFloatingActions({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmitSearch,
  onClearSearch,
  isLoading = false,
  onBackToTop,
}: CatalogFloatingActionsProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Support Escape key to close category dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoryOpen(false);
      }
    };
    if (categoryOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch();
  };

  const handleSelectCategory = (cat: string) => {
    onCategoryChange(cat);
    setCategoryOpen(false);
  };

  const handleBack = () => {
    if (onBackToTop) {
      onBackToTop();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* 1. Tombol Kembali: Menggantikan Logo & Navbar ketika discroll, klik untuk kembali ke atas */}
      <button
        type="button"
        onClick={handleBack}
        title="Kembali ke atas"
        className="h-11 sm:h-12 px-3 sm:px-4 bg-white brutal-border brutal-shadow rounded-2xl flex items-center justify-center gap-1.5 brutal-btn cursor-pointer shrink-0 hover:bg-[#FFD027] transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5 text-black shrink-0" />
        <span className="hidden sm:inline font-black text-xs uppercase tracking-wider text-black">
          Kembali
        </span>
      </button>

      {/* 2. Input Search Langsung di Sebelahnya + Tombol Cari (Tanpa Modal) */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 flex items-center gap-2 min-w-0"
      >
        <div className="relative flex-1 min-w-0 h-11 sm:h-12">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk atau barcode..."
            className="w-full h-full bg-white brutal-border brutal-shadow rounded-2xl pl-3.5 sm:pl-4 pr-9 text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
          />
          {searchQuery && onClearSearch && (
            <button
              type="button"
              onClick={() => onClearSearch()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
              title="Hapus pencarian"
            >
              <Icons.Close className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          title="Terapkan Pencarian"
          className="h-11 sm:h-12 px-3.5 sm:px-5 bg-[#FFD027] brutal-border brutal-shadow rounded-2xl font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 hover:bg-[#ffe066] transition-colors"
        >
          <Icons.Search className="w-4 h-4 text-black shrink-0" />
          <span className="hidden md:inline">Cari</span>
        </button>
      </form>

      {/* 3. Dropdown Filter Kategori */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setCategoryOpen(!categoryOpen)}
          title="Filter Kategori Produk"
          className={`h-11 sm:h-12 px-3 sm:px-3.5 rounded-2xl brutal-border brutal-shadow flex items-center justify-center gap-1.5 brutal-btn cursor-pointer transition-colors ${
            selectedCategory !== 'all' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-4 h-4 text-black shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="hidden lg:inline font-black text-xs uppercase tracking-wider text-black max-w-[120px] truncate">
            {selectedCategory === 'all' ? 'Kategori' : CATEGORY_LABELS_MAP[selectedCategory] || selectedCategory}
          </span>
          <Icons.ChevronDown className="w-3.5 h-3.5 text-black shrink-0" />
        </button>

        {categoryOpen && (
          <>
            {/* Invisible backdrop for easy outside clicks */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setCategoryOpen(false)}
            />

            <div
              className="absolute top-full right-0 mt-2 z-50 w-56 sm:w-64 bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b-2 border-black/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Pilih Kategori
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(false)}
                  className="text-gray-400 hover:text-black text-xs font-black cursor-pointer p-0.5"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
                {CATALOG_CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleSelectCategory(cat.value)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between brutal-btn cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                          : 'bg-white text-black hover:bg-gray-50 brutal-border-sm'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      {isSelected && <Icons.Check className="w-3.5 h-3.5 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
