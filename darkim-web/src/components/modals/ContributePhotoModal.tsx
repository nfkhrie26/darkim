'use client';

import { Icons } from '@/components/ui/Icons';
import ContributePhotoTab from './contribute/ContributePhotoTab';

interface ContributePhotoModalProps {
  isOpen: boolean;
  barcode: string;
  productName?: string;
  brand?: string;
  category?: string;
  isNewProduct?: boolean;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export default function ContributePhotoModal({
  isOpen,
  barcode,
  productName,
  brand,
  category,
  isNewProduct,
  onClose,
  onSubmitSuccess,
}: ContributePhotoModalProps) {
  if (!isOpen) return null;

  const isNew =
    isNewProduct ?? (!productName || productName.trim() === '' || productName === 'Produk Tanpa Nama');

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
            <span
              className={`${
                isNew ? 'bg-[#FFD027]' : 'bg-[#00D084]'
              } brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black`}
            >
              {isNew ? 'Produk Belum Terdaftar' : 'Perbaikan Data Gizi'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-black">
            {isNew ? 'Lengkapi Data Produk Baru' : 'Perbaiki Informasi Nilai Gizi'}
          </h3>
          <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
            {isNew
              ? 'Produk ini belum ada di Open Food Facts. Wajib mencantumkan foto kemasan depan dan foto informasi nilai gizi.'
              : 'Wajib mencantumkan foto tabel informasi nilai gizi untuk verifikasi. Foto kemasan depan opsional.'}
          </p>
          {(barcode || productName) && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mt-2">
              {productName && (
                <span className="bg-[#E6F1EA] brutal-border-sm px-2 py-0.5 rounded text-black font-black">
                  {productName}
                </span>
              )}
              {barcode && (
                <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-black font-mono">
                  {barcode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ContributePhotoTab with explicit isNewProduct */}
        <ContributePhotoTab
          barcode={barcode}
          initialName={productName}
          initialBrand={brand}
          initialCategory={category}
          isNewProduct={isNew}
          onSuccess={onSubmitSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
