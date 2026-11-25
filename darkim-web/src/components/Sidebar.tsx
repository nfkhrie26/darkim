'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

interface SidebarProps {
  onToggleTableMode?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function Sidebar({ onToggleTableMode, onShowToast }: SidebarProps) {
  const pathname = usePathname();
  const isScanner = pathname === '/';
  const isKatalog = pathname === '/katalog';

  return (
    <aside className="flex lg:flex-col gap-3 bg-white brutal-border brutal-shadow rounded-2xl p-2.5 shrink-0 self-center lg:self-start sticky top-4 z-20">
      {/* 1. Barcode Scanner Page Link */}
      <Link
        href="/"
        title="Halaman Pindai Barcode"
        className={`w-11 h-11 rounded-xl ${
          isScanner ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
        } brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer`}
      >
        <Icons.Barcode className="w-5 h-5 text-black" />
      </Link>

      {/* 2. Katalog Produk Link */}
      <Link
        href="/katalog"
        title="Katalog Produk"
        className={`w-11 h-11 rounded-xl ${
          isKatalog ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
        } brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer`}
      >
        <Icons.Search className="w-5 h-5 text-black" />
      </Link>

      {/* 3. Settings Button */}
      <button
        type="button"
        title="Pengaturan Pemindai"
        onClick={() => onShowToast?.('Pengaturan: Sensitivitas pemindai otomatis aktif.')}
        className="w-11 h-11 rounded-xl bg-white hover:bg-gray-50 brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer"
      >
        <Icons.Settings className="w-5 h-5 text-black" />
      </button>

      {/* 4. Table Mode Toggle Button */}
      <button
        type="button"
        title="Beralih Mode Tampilan Gizi (Tabel / Status)"
        onClick={() => onToggleTableMode?.()}
        className="w-11 h-11 rounded-xl bg-[#FFD027] hover:bg-amber-300 brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer"
      >
        <Icons.Table className="w-5 h-5 text-black" />
      </button>
    </aside>
  );
}
