'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  image?: string | null;
}

export default function ProductCard({
  id,
  barcode,
  name,
  brand,
  category,
  image,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const targetId = barcode || id;
  const showRealImage = Boolean(image && !imgError);
  const subtitle = brand && brand !== 'Tanpa Brand' ? `${brand} • ${category}` : category;

  return (
    <div className="product-item bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5">
      <div>
        {/* Product Thumbnail Box */}
        <div
          className={`w-full aspect-[16/9] ${
            showRealImage ? 'bg-white' : 'bg-[#1a232b]'
          } brutal-border-sm rounded-xl overflow-hidden mb-3 relative flex items-center justify-center`}
        >
          {showRealImage ? (
            <img
              src={image as string}
              alt={name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-2 bg-white"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2a3744] to-[#121921] flex flex-col items-center justify-center p-3 relative select-none">
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">DARKIM</span>
              <span className="text-[11px] font-bold text-white/90 text-center leading-tight mt-1 line-clamp-1">
                {name}
              </span>
              <div className="absolute bottom-1.5 inset-x-4 h-3 bg-white/10 rounded flex items-center justify-center gap-0.5 opacity-60">
                <div className="w-1 h-2 bg-white"></div>
                <div className="w-0.5 h-2 bg-white"></div>
                <div className="w-1.5 h-2 bg-white"></div>
                <div className="w-0.5 h-2 bg-white"></div>
                <div className="w-1 h-2 bg-white"></div>
              </div>
            </div>
          )}
        </div>

        {/* Product Name & Brand/Category */}
        <h3 className="text-sm sm:text-base font-black text-black leading-snug line-clamp-1 mb-0.5" title={name}>
          {name}
        </h3>
        <p className="text-xs font-semibold text-gray-500 line-clamp-1 mb-4" title={subtitle}>
          {subtitle}
        </p>
      </div>

      {/* Action Button: INFORMASI GIZI -> Directs to /produk/[barcode] */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <span className="text-[10px] font-mono font-bold text-gray-400 truncate">
          {barcode}
        </span>
        <Link
          href={`/produk/${targetId}`}
          className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black brutal-btn inline-flex items-center justify-center cursor-pointer shrink-0"
        >
          INFORMASI GIZI
        </Link>
      </div>
    </div>
  );
}
