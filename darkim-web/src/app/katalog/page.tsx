'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import CatalogSearchBar from '@/components/catalog/CatalogSearchBar';
import ProductCard from '@/components/catalog/ProductCard';
import CatalogPagination from '@/components/catalog/CatalogPagination';

interface CatalogProduct {
  id: string;
  barcode: string;
  name: string;
  category: string;
  image?: string | null;
}

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Base 6 products matching the visual mockup
  const catalogProducts: CatalogProduct[] = [
    {
      id: 'ultra-milk',
      barcode: '8992753123456',
      name: 'Ultra Milk 250ml',
      category: 'Minuman',
    },
    {
      id: 'koko-krunch',
      barcode: '8991234567890',
      name: 'Koko Krunch Sereal 170g',
      category: 'Makanan',
    },
    {
      id: 'teh-botol',
      barcode: '8998866200256',
      name: 'Teh Botol Sosro 250ml',
      category: 'Minuman',
    },
    {
      id: 'indomie-goreng',
      barcode: '089686010924',
      name: 'Indomie Mi Goreng 85g',
      category: 'Makanan',
    },
    {
      id: 'bear-brand',
      barcode: '7613035889981',
      name: 'Susu Bear Brand 189ml',
      category: 'Minuman',
    },
    {
      id: 'oreo-vanilla',
      barcode: '8992760136012',
      name: 'Oreo Biskuit Vanilla 133g',
      category: 'Makanan',
    },
  ];

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const cat = selectedCategory.toLowerCase();

      const matchesCat = cat === 'all' || item.category.toLowerCase() === cat;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.barcode.includes(q);

      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const label = cat === 'all' ? 'SEMUA KATEGORI' : cat.toUpperCase();
    showToast(`Kategori aktif: ${label}`);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Header & Branding */}
      <Header />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        {/* Left Vertical Floating Sidebar */}
        <Sidebar onShowToast={showToast} />

        {/* Right Content: Catalog Section */}
        <section className="flex-1 w-full flex flex-col gap-5">
          {/* Top Search Bar & 3-Categories Dropdown */}
          <CatalogSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSubmitSearch={() => showToast('Pencarian katalog diperbarui.')}
          />

          {/* Product Grid (3 columns on desktop x 2 rows, matching visual screenshot) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.barcode}
                  id={p.id}
                  barcode={p.barcode}
                  name={p.name}
                  category={p.category}
                  image={p.image}
                />
              ))}
            </div>
          ) : (
            /* Empty State if search yields 0 matches */
            <div className="bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center my-4">
              <p className="font-black text-base text-black mb-1">
                Tidak ada produk yang cocok dengan pencarian.
              </p>
              <p className="text-xs font-semibold text-gray-500">
                Coba gunakan kata kunci lain atau pilih &quot;ALL CATEGORIES&quot;.
              </p>
            </div>
          )}

          {/* Pagination Bar */}
          <CatalogPagination
            currentPage={currentPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              showToast(`Halaman ${page} dimuat.`);
            }}
          />
        </section>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

