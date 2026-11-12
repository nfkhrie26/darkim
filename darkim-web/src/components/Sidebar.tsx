'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="6" width="2" height="12" />
          <rect x="5" y="6" width="1" height="12" />
          <rect x="7" y="6" width="3" height="12" />
          <rect x="12" y="6" width="1.5" height="12" />
          <rect x="15" y="6" width="2" height="12" />
          <rect x="18" y="6" width="1" height="12" />
          <rect x="20" y="6" width="2" height="12" />
        </svg>
      </Link>

      {/* 2. Katalog Produk Link (Search Icon - Kaca Pembesar) */}
      <Link
        href="/katalog"
        title="Katalog Produk"
        className={`w-11 h-11 rounded-xl ${
          isKatalog ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
        } brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer`}
      >
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" strokeLinecap="round" />
        </svg>
      </Link>

      {/* 3. Settings Button */}
      <button
        type="button"
        title="Pengaturan Pemindai"
        onClick={() => onShowToast?.('⚙️ Pengaturan: Sensitivitas pemindai otomatis aktif.')}
        className="w-11 h-11 rounded-xl bg-white hover:bg-gray-50 brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer"
      >
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* 4. DT Button (Yellow #FFD027) */}
      <button
        type="button"
        title="Beralih Mode Tampilan Gizi (DT)"
        onClick={() => onToggleTableMode?.()}
        className="w-11 h-11 rounded-xl bg-[#FFD027] hover:bg-amber-300 brutal-border-sm brutal-shadow-sm flex items-center justify-center font-black text-sm brutal-btn cursor-pointer"
      >
        DT
      </button>
    </aside>
  );
}
