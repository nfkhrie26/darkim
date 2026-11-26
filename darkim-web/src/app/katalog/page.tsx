'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import CatalogSearchBar from '@/components/catalog/CatalogSearchBar';
import CatalogFloatingActions from '@/components/catalog/CatalogFloatingActions';
import ProductCard from '@/components/catalog/ProductCard';
import CatalogPagination from '@/components/catalog/CatalogPagination';
import { Icons } from '@/components/ui/Icons';
import { CatalogProductItem, CatalogSearchResponse } from '@/types';
import { CATEGORY_LABELS_MAP } from '@/lib/catalogCategories';

const PAGE_SIZE = 6;

export default function CatalogPage() {
  const [inputQuery, setInputQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll threshold to toggle sticky header into inline search row
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const fetchCatalog = useCallback(
    async (query: string, category: string, page: number, signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({
          q: query,
          category,
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });

        const res = await fetch(`/api/catalog?${params.toString()}`, { signal });
        const data: CatalogSearchResponse = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal mengambil data katalog.');
        }

        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);

        if (data.source === 'local-fallback' && data.message) {
          showToast(data.message);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setErrorMsg(err?.message || 'Tidak dapat memuat produk dari OpenFoodFacts.');
        setProducts([]);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(appliedQuery, selectedCategory, currentPage, controller.signal);
    return () => controller.abort();
  }, [appliedQuery, selectedCategory, currentPage, fetchCatalog]);

  const handleSubmitSearch = () => {
    const trimmed = inputQuery.trim();
    if (trimmed === appliedQuery && currentPage === 1) {
      fetchCatalog(trimmed, selectedCategory, 1);
      return;
    }
    setCurrentPage(1);
    setAppliedQuery(trimmed);
  };

  const handleClearSearch = () => {
    setInputQuery('');
    setCurrentPage(1);
    setAppliedQuery('');
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 bg-[#E6F1EA]">
      {/* Sticky Floating Header: Replaces Logo + Nav with Inline Search Bar when scrolled */}
      <Header
        stickyOverride={
          isScrolled ? (
            <CatalogFloatingActions
              searchQuery={inputQuery}
              onSearchChange={setInputQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onSubmitSearch={handleSubmitSearch}
              onClearSearch={handleClearSearch}
              isLoading={isLoading}
              onBackToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        <section className="flex-1 w-full flex flex-col gap-4">
          {/* Top Search Bar & 3-Categories Dropdown (Desktop & Mobile Top) */}
          <CatalogSearchBar
            searchQuery={inputQuery}
            onSearchChange={setInputQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSubmitSearch={handleSubmitSearch}
            onClearSearch={handleClearSearch}
            isLoading={isLoading}
          />

          {/* Status Metadata Bar */}
          {(!isLoading && !errorMsg) || appliedQuery || selectedCategory !== 'all' ? (
            <div className="flex items-center justify-between gap-2 flex-wrap px-1">
              {!isLoading && !errorMsg ? (
                <span className="text-xs font-bold text-gray-700">
                  {totalCount.toLocaleString('id-ID')} produk Indonesia ditemukan
                </span>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    title="Hapus filter kategori"
                    className="text-xs font-black text-black bg-[#00D084] hover:bg-[#00be78] brutal-border-sm rounded-lg px-2.5 py-1 inline-flex items-center gap-1 cursor-pointer brutal-btn"
                  >
                    <span>Kategori: {CATEGORY_LABELS_MAP[selectedCategory] || selectedCategory}</span>
                    <Icons.Close className="w-3 h-3" />
                  </button>
                )}

                {appliedQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title="Hapus filter kata kunci"
                    className="text-xs font-black text-black bg-white hover:bg-gray-100 brutal-border-sm rounded-lg px-2.5 py-1 inline-flex items-center gap-1 cursor-pointer brutal-btn"
                  >
                    <span>Filter: &quot;{appliedQuery}&quot;</span>
                    <Icons.Close className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Content Area: Loading Skeleton / Error / Grid / Empty */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col justify-between animate-pulse"
                >
                  <div>
                    <div className="w-full aspect-[16/9] bg-gray-200 brutal-border-sm rounded-xl mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <div className="h-8 w-32 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMsg ? (
            <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center my-4 flex flex-col items-center gap-3">
              <p className="font-black text-base text-red-600">{errorMsg}</p>
              <button
                type="button"
                onClick={() => fetchCatalog(appliedQuery, selectedCategory, currentPage)}
                className="bg-[#FFD027] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.Refresh className="w-4 h-4 text-black" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.barcode}
                  id={p.id}
                  barcode={p.barcode}
                  name={p.name}
                  brand={p.brand}
                  category={p.category}
                  image={p.image}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center my-4">
              <p className="font-black text-base text-black mb-1">
                Tidak ada produk OpenFoodFacts yang cocok.
              </p>
              <p className="text-xs font-semibold text-gray-500">
                Coba kata kunci atau kode barcode lain, atau pilih &quot;ALL CATEGORIES&quot;.
              </p>
            </div>
          )}

          {/* Dynamic Pagination Bar */}
          {!errorMsg && (products.length > 0 || currentPage > 1) && (
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              disabled={isLoading}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
