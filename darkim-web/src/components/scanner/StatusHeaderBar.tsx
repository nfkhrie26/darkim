'use client';

import { Icons } from '@/components/ui/Icons';

interface StatusHeaderBarProps {
  badge: string;
  badgeBg: string;
  onOpenReport?: () => void;
}

/**
 * Top bar above the nutrition warning card:
 * Left: Evaluation status badge (AMAN / HATI-HATI / TIDAK AMAN / DATA TIDAK LENGKAP).
 * Right (mirrored): Red product discrepancy report button.
 */
export default function StatusHeaderBar({
  badge,
  badgeBg,
  onOpenReport,
}: StatusHeaderBarProps) {
  return (
    <div className={`w-full flex items-center ${onOpenReport ? 'justify-between' : 'justify-start'} gap-2 pb-3 mb-3.5 border-b-2 border-black/10 flex-wrap`}>
      <div
        className="brutal-border-sm brutal-shadow-sm rounded-lg px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-black uppercase tracking-wider"
        style={{
          backgroundColor: badgeBg,
          color: badgeBg === '#FF4D4D' ? '#FFFFFF' : '#000000',
        }}
      >
        {badge}
      </div>

      {onOpenReport && (
        <button
          type="button"
          onClick={onOpenReport}
          title="Produk Tidak Sesuai? Laporkan Pada Kami!"
          className="bg-[#FF4D4D] hover:bg-[#e63e3e] text-white brutal-border-sm brutal-shadow-sm rounded-lg px-3 sm:px-3.5 py-1 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 brutal-btn cursor-pointer"
        >
          <Icons.Flag className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="sm:hidden">Laporkan</span>
          <span className="hidden sm:inline">Produk Tidak Sesuai?</span>
        </button>
      )}
    </div>
  );
}
