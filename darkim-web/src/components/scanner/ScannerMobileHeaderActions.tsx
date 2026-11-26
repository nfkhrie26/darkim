'use client';

import { Icons } from '@/components/ui/Icons';

interface ScannerMobileHeaderActionsProps {
  activeTab: 'camera' | 'photo';
  onTabChange: (tab: 'camera' | 'photo') => void;
}

/**
 * Mobile-only floating icon action buttons for Scanner (Kamera & Galeri),
 * rendered at the top-right of Header, perfectly aligned with DARKIM Logo.
 */
export default function ScannerMobileHeaderActions({
  activeTab,
  onTabChange,
}: ScannerMobileHeaderActionsProps) {
  return (
    <div className="md:hidden flex items-center gap-2 animate-in fade-in duration-150">
      {/* Tombol Kamera (Icon Only) */}
      <button
        type="button"
        onClick={() => onTabChange('camera')}
        title="Mode Kamera"
        className={`w-12 h-12 rounded-xl brutal-border brutal-shadow flex items-center justify-center brutal-btn cursor-pointer ${
          activeTab === 'camera' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Icons.Camera className="w-5 h-5 text-black shrink-0" />
      </button>

      {/* Tombol Galeri (Icon Only) */}
      <button
        type="button"
        onClick={() => onTabChange('photo')}
        title="Mode Galeri Foto"
        className={`w-12 h-12 rounded-xl brutal-border brutal-shadow flex items-center justify-center brutal-btn cursor-pointer ${
          activeTab === 'photo' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Icons.Gallery className="w-5 h-5 text-black shrink-0" />
      </button>
    </div>
  );
}
