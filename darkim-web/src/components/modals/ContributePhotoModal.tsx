'use client';

import { Icons } from '@/components/ui/Icons';
import ContributePhotoTab from './contribute/ContributePhotoTab';

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
            Unggah foto produk kemasan depan. Jika foto tabel informasi gizi tidak tersedia, Anda dapat menginput nilai gizinya pada langkah berikutnya.
          </p>
          {barcode && (
            <p className="text-xs font-mono font-bold text-gray-700 mt-2">
              Barcode: <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-black font-mono">{barcode}</span>
            </p>
          )}
        </div>

        {/* Pure Linear Wizard (Photo Upload -> Conditional Nutrition Form) */}
        <ContributePhotoTab
          barcode={barcode}
          onSuccess={onSubmitSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
