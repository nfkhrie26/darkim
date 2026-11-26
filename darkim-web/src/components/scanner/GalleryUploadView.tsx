'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';

interface GalleryUploadViewProps {
  selectedPhotoPreview: string | null;
  selectedPhotoFile: File | null;
  isScanning: boolean;
  onTriggerFileSelect: () => void;
  onScanImage: (file: File, mode?: 'fast' | 'deep') => void;
}

export default function GalleryUploadView({
  selectedPhotoPreview,
  selectedPhotoFile,
  isScanning,
  onTriggerFileSelect,
  onScanImage,
}: GalleryUploadViewProps) {
  return (
    <>
      {selectedPhotoPreview ? (
        <div
          onClick={onTriggerFileSelect}
          title="Klik untuk mengganti foto"
          className="w-full h-full bg-black flex items-center justify-center p-2 cursor-pointer group relative"
        >
          <img
            src={selectedPhotoPreview}
            alt="Pratinjau Foto Barcode"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-black font-black text-xs px-3 py-1.5 rounded-lg brutal-border-sm">
              Ganti Foto
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={onTriggerFileSelect}
          className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#E6F1EA] brutal-border brutal-shadow flex items-center justify-center mb-4">
            <Icons.Gallery className="w-10 h-10 text-black" />
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-black mb-1">
            PILIH FOTO DARI GALERI
          </span>
          <p className="text-[11px] font-semibold text-gray-500 max-w-[220px]">
            Tekan di sini untuk memilih foto barcode kemasan dari penyimpanan perangkat Anda
          </p>
        </div>
      )}

      {/* Photo Tab Action Button */}
      <button
        type="button"
        title={selectedPhotoFile ? 'Pindai Ulang Foto Terpilih' : 'Pilih Foto dari Galeri'}
        disabled={isScanning}
        onClick={() => {
          if (selectedPhotoFile) {
            onScanImage(selectedPhotoFile, 'deep');
          } else {
            onTriggerFileSelect();
          }
        }}
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-xl bg-[#00D084] brutal-border-sm brutal-shadow flex items-center justify-center brutal-btn cursor-pointer ${
          isScanning ? 'opacity-70 animate-pulse' : ''
        }`}
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </button>
    </>
  );
}
