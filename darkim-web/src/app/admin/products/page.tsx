'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductModel } from '@/types';
import { Icons } from '@/components/ui/Icons';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = query.trim() ? `/api/admin/products?q=${encodeURIComponent(query.trim())}` : '/api/admin/products';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query]);

  // Read URL query params on mount for notifications (e.g., after creating a product)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('created')) {
        const msg = params.get('msg') || 'Produk berhasil dikirim ke Open Food Facts!';
        setSyncNotification(msg);
        setTimeout(() => setSyncNotification(null), 5000);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-[#E6F1EA]">
      {/* Standard Admin Navbar */}
      <AdminHeader currentTab="products" />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        {syncNotification && (
          <div className="bg-[#00D084]/20 brutal-border brutal-shadow-sm rounded-2xl p-4 text-xs font-black text-black flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Icons.Check className="w-4 h-4 text-black shrink-0" />
              <span>{syncNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncNotification(null)}
              className="text-black hover:text-red-600 font-black cursor-pointer ml-2"
            >
              <Icons.Close className="w-4 h-4 text-black" />
            </button>
          </div>
        )}

        {/* Explorer Header & Search Controls */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black">
                Live Open Food Facts
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black">Explorer Database Produk</h1>
            <p className="text-xs font-semibold text-gray-600 mt-1 max-w-xl leading-relaxed">
              Pencarian live data produk pangan dari Open Food Facts. Data diambil langsung tanpa perantara lokal untuk memastikan selalu terbarukan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama / barcode..."
                className="bg-white brutal-border-sm rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 w-56 sm:w-64"
              />
            </div>
            <Link
              href="/admin/products/new"
              className="bg-[#00D084] brutal-border brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-black brutal-btn cursor-pointer shrink-0 inline-flex items-center gap-1.5"
            >
              <span>+ Tambah Produk</span>
            </Link>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Icons.Refresh className="w-8 h-8 animate-spin mx-auto mb-2 text-black" />
              <p className="text-xs sm:text-sm font-bold text-gray-600">Memuat produk dari Open Food Facts...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <Icons.Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-black text-black">Tidak ada produk yang cocok dengan pencarian.</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                Ketik nama atau nomor barcode lain, atau tambahkan produk baru ke Open Food Facts.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2.5 border-black text-xs font-black uppercase text-black bg-[#FFD027]/25">
                  <th className="py-3 px-3.5">Barcode</th>
                  <th className="py-3 px-3.5">Nama Produk</th>
                  <th className="py-3 px-3.5">Brand</th>
                  <th className="py-3 px-3.5">Kategori</th>
                  <th className="py-3 px-3.5 text-right">Gula (100g)</th>
                  <th className="py-3 px-3.5 text-right">Natrium (100g)</th>
                  <th className="py-3 px-3.5 text-right">Tautan Global</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 text-xs font-medium">
                {products.map((p) => (
                  <tr key={p.id || p.barcode} className="hover:bg-[#E6F1EA]/30 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-bold text-black">{p.barcode}</td>
                    <td className="py-3.5 px-3.5 font-bold text-black">{p.name}</td>
                    <td className="py-3.5 px-3.5 text-gray-700">{p.brand || '-'}</td>
                    <td className="py-3.5 px-3.5 text-gray-700">{p.category || '-'}</td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-black">{p.sugars ?? 0} g</td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-black">{p.sodium ?? 0} mg</td>
                    <td className="py-3.5 px-3.5 text-right">
                      <a
                        href={`https://world.openfoodfacts.org/product/${p.barcode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-[#00D084]/20 text-black brutal-border-sm brutal-shadow-sm px-2.5 py-1 rounded-lg font-black text-[10px] uppercase cursor-pointer brutal-btn inline-flex items-center gap-1.5 shrink-0"
                        title="Buka halaman produk di Open Food Facts"
                      >
                        <Icons.Globe className="w-3 h-3 text-black" />
                        <span>Lihat di OFF ↗</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
