'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';

interface CatalogFloatingActionsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onSubmitSearch: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Semua Kategori',
  makanan: 'Makanan',
  minuman: 'Minuman',
};

/**
 * CatalogFloatingActions
 * Floating action buttons (Search & Category Filter) that appear in the sticky top header
 * when the user scrolls down on both desktop and mobile views.
 */
export default function CatalogFloatingActions({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSubmitSearch,
  onClearSearch,
  isLoading = false,
}: CatalogFloatingActionsProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor scroll threshold (scrollY > 80)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setSearchOpen(false);
        setCategoryOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Autofocus input when search overlay is opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  // Support Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCategoryOpen(false);
      }
    };
    if (searchOpen || categoryOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, categoryOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch();
    setSearchOpen(false);
  };

  const handleSelectCategory = (cat: string) => {
    onCategoryChange(cat);
    setCategoryOpen(false);
  };

  if (!isScrolled) return null;

  return (
    <>
      {/* 1. Floating Action Icon Buttons (Top-Right in Header, exactly matches DARKIM Logo height) */}
      <div className="flex items-center gap-2 animate-in fade-in duration-150">
        {/* Tombol Search (Icon) */}
        <button
          type="button"
          onClick={() => {
            setCategoryOpen(false);
            setSearchOpen(true);
          }}
          title="Cari Produk Katalog"
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl brutal-border brutal-shadow flex items-center justify-center brutal-btn cursor-pointer transition-colors ${
            searchQuery ? 'bg-[#00D084]' : 'bg-[#FFD027]'
          }`}
        >
          <Icons.Search className="w-5 h-5 text-black shrink-0" />
        </button>

        {/* Tombol Filter Kategori (Icon with anchored dropdown) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setCategoryOpen(!categoryOpen);
            }}
            title="Filter Kategori Produk"
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl brutal-border brutal-shadow flex items-center justify-center brutal-btn cursor-pointer transition-colors ${
              selectedCategory !== 'all' ? 'bg-[#00D084]' : 'bg-white'
            }`}
          >
            <svg
              className="w-5 h-5 text-black shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          {/* Category Dropdown Menu (Anchored directly beneath the filter button) */}
          {categoryOpen && (
            <>
              {/* Invisible backdrop for easy outside clicks */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setCategoryOpen(false)}
              />

              <div
                className="absolute top-full right-0 mt-2.5 z-50 w-56 bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl"
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

                <div className="flex flex-col gap-1.5">
                  {(['all', 'makanan', 'minuman'] as const).map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between brutal-btn cursor-pointer ${
                          isSelected
                            ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                            : 'bg-white text-black hover:bg-gray-50 brutal-border-sm'
                        }`}
                      >
                        <span>{CATEGORY_LABELS[cat]}</span>
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

      {/* 2. Search Form Overlay (Pops up when clicking the floating search button) */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-start justify-center p-3 pt-16 sm:pt-20 md:pt-24 animate-in fade-in pointer-events-auto"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-4 sm:p-5 relative animate-in slide-in-from-top-3 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black">
                  Pencarian
                </span>
                <h3 className="font-black text-sm text-black">Cari Produk Katalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-black hover:text-red-600 p-1 cursor-pointer"
                title="Tutup"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ketik nama atau barcode produk..."
                  className="w-full bg-white brutal-border-sm rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                />
                {searchQuery && onClearSearch && (
                  <button
                    type="button"
                    onClick={() => onClearSearch()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer p-1"
                    title="Hapus pencarian"
                  >
                    <Icons.Close className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {searchQuery && onClearSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearSearch();
                      setSearchOpen(false);
                    }}
                    className="bg-white brutal-border-sm rounded-xl px-3.5 py-2.5 font-bold text-xs text-black hover:bg-gray-100 brutal-btn cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#FFD027] brutal-border-sm brutal-shadow-sm rounded-xl py-2.5 font-black uppercase tracking-wider text-xs text-black brutal-btn cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Icons.Search className="w-4 h-4 text-black" />
                  <span>Terapkan Pencarian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
