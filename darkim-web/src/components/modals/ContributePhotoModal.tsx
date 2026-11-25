'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';
import ContributePhotoTab from './contribute/ContributePhotoTab';
import ContributeManualTab from './contribute/ContributeManualTab';

interface ContributePhotoModalProps {
  isOpen: boolean;
  barcode: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export default function ContributePhotoModal({
  isOpen,
  barcode,
  onClose,
  onSubmitSuccess,
}: ContributePhotoModalProps) {
  // Mode: 'MANUAL' for entering nutrition directly, 'PHOTO' for uploading packaging images
  const [activeTab, setActiveTab] = useState<'PHOTO' | 'MANUAL'>('MANUAL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-xl relative duration-150 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 cursor-pointer transition-colors"
          title="Tutup"
        >
          <Icons.Close className="w-5 h-5 text-black" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
              Kontribusi Komunitas
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-black">
            Bantu Lengkapi Data Produk
          </h3>
          <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
            Pilih cara yang paling mudah: unggah foto kemasan atau input langsung nilai gizi yang Anda baca pada tabel kemasan.
          </p>
          {barcode && (
            <p className="text-xs font-mono font-bold text-gray-700 mt-2">
              Barcode: <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-black font-mono">{barcode}</span>
            </p>
          )}
        </div>

        {/* Neo-Brutalist Mode Switcher Tabs */}
        <div className="flex gap-2 p-1.5 bg-gray-100 brutal-border-sm rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('MANUAL')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'MANUAL'
                ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 brutal-border-sm'
            }`}
          >
            <span>✍️ Input Mandiri Gizi</span>
            <span className="bg-[#FFD027] text-black text-[9px] px-1.5 py-0.2 rounded font-black brutal-border-sm">
              Cepat
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PHOTO')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'PHOTO'
                ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 brutal-border-sm'
            }`}
          >
            <span>📸 Unggah Foto</span>
          </button>
        </div>

        {/* Modular Tabs */}
        {activeTab === 'MANUAL' ? (
          <ContributeManualTab
            barcode={barcode}
            onSuccess={onSubmitSuccess}
            onClose={onClose}
          />
        ) : (
          <ContributePhotoTab
            barcode={barcode}
            onSuccess={onSubmitSuccess}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
