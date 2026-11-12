'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductModel } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [energy, setEnergy] = useState('');
  const [sugars, setSugars] = useState('');
  const [sodium, setSodium] = useState('');
  const router = useRouter();

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari database?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Gagal menghapus produk.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !name.trim()) return;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: barcode.trim(),
          name: name.trim(),
          brand: brand.trim() || undefined,
          category: category.trim() || undefined,
          energy: energy ? Number(energy) : undefined,
          sugars: sugars ? Number(sugars) : undefined,
          sodium: sodium ? Number(sodium) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setBarcode('');
        setName('');
        setBrand('');
        fetchProducts();
      } else {
        alert(data.message || 'Gagal menyimpan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Admin Navbar */}
      <header className="w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-white brutal-border brutal-shadow rounded-xl px-4 py-2 inline-flex items-center gap-1">
            <span className="text-2xl font-black text-black">DARK</span>
            <span className="text-2xl font-black text-[#00D084]">IM</span>
          </Link>
          <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-1 rounded-lg text-xs font-black uppercase text-black">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/tickets"
            className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn hover:bg-gray-50"
          >
            Tiket Laporan
          </Link>
          <Link
            href="/admin/products"
            className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn"
          >
            Database Produk
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-red-600 brutal-btn hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black">Manajemen Database Produk</h1>
            <p className="text-xs font-semibold text-gray-500">
              Daftar seluruh produk yang tersimpan di PostgreSQL lokal (hasil seed, auto-cache OFF, dan input manual).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / barcode..."
              className="brutal-border-sm rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn cursor-pointer shrink-0"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-gray-500">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold text-gray-500">
              Tidak ada produk yang cocok dengan pencarian.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-black text-xs font-black uppercase text-black bg-gray-100">
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Gula</th>
                  <th className="py-2.5 px-3 text-right">Natrium</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 text-xs font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono font-bold text-black">{p.barcode}</td>
                    <td className="py-3 px-3 font-bold text-black">{p.name}</td>
                    <td className="py-3 px-3 text-gray-600">{p.brand}</td>
                    <td className="py-3 px-3 text-gray-600">{p.category}</td>
                    <td className="py-3 px-3 text-right font-bold text-black">{p.sugars ?? 0} g</td>
                    <td className="py-3 px-3 text-right font-bold text-black">{p.sodium ?? 0} mg</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-lg relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-black hover:text-red-500 font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-base sm:text-lg font-black text-black mb-3">Tambah Produk Baru ke Database</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-black block mb-1">Barcode (EAN-13 / UPC) *</label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="899..."
                  className="w-full brutal-border-sm rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-black block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full brutal-border-sm rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-black block mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full brutal-border-sm rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-black block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full brutal-border-sm rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-black block mb-1">Energi (kkal)</label>
                  <input
                    type="number"
                    step="any"
                    value={energy}
                    onChange={(e) => setEnergy(e.target.value)}
                    className="w-full brutal-border-sm rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-black block mb-1">Gula (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={sugars}
                    onChange={(e) => setSugars(e.target.value)}
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
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2 font-black uppercase text-black brutal-btn"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

