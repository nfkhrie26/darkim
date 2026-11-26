'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';

interface AdminHeaderProps {
  currentTab?: 'tickets' | 'products';
}

export default function AdminHeader({ currentTab }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/admin/login');
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Branding & Admin Pill */}
      <div className="flex items-center gap-3 flex-wrap">
        <DarkimLogo title="Ke Beranda DARKIM" />

        <div className="bg-[#FFD027] brutal-border-sm brutal-shadow-sm px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 select-none">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/tickets"
          className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer inline-flex items-center gap-1.5 ${
            currentTab === 'tickets'
              ? 'bg-[#00D084] text-black brutal-border brutal-shadow-sm'
              : 'bg-white text-black hover:bg-gray-50 brutal-border-sm brutal-shadow-sm'
          }`}
        >
          <Icons.Alert className="w-3.5 h-3.5 text-black" />
          <span>Tiket Laporan</span>
        </Link>

        <Link
          href="/admin/products"
          className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer inline-flex items-center gap-1.5 ${
            currentTab === 'products'
              ? 'bg-[#00D084] text-black brutal-border brutal-shadow-sm'
              : 'bg-white text-black hover:bg-gray-50 brutal-border-sm brutal-shadow-sm'
          }`}
        >
          <Icons.Search className="w-3.5 h-3.5 text-black" />
          <span>Database Produk</span>
        </Link>

        <Link
          href="/"
          className="bg-white text-black hover:bg-gray-50 brutal-border-sm brutal-shadow-sm rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center gap-1.5"
          title="Buka Aplikasi Pengguna"
        >
          <Icons.Barcode className="w-3.5 h-3.5 text-black" />
          <span>Aplikasi</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-white text-[#FF4D4D] hover:bg-red-50 hover:text-red-700 brutal-border-sm brutal-shadow-sm rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center gap-1.5 cursor-pointer"
          title="Keluar dari Admin Panel"
        >
          <Icons.Close className="w-3.5 h-3.5 text-[#FF4D4D]" />
          <span>Logout</span>
        </button>
      </nav>
    </header>
  );
}
