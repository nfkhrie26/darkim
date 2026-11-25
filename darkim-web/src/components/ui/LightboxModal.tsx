'use client';

import { useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface LightboxModalProps {
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
}

export default function LightboxModal({
  imageUrl,
  alt = 'Lampiran Penuh',
  onClose,
}: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl brutal-border-lg brutal-shadow-lg bg-white"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 bg-white text-black brutal-border-sm brutal-shadow-sm rounded-xl p-2 hover:bg-gray-100 brutal-btn cursor-pointer"
          title="Tutup (Esc)"
        >
          <Icons.Close className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
}
