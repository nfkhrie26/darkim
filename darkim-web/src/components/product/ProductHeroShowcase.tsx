'use client';

import { ProductModel } from '@/types';
import DarkimIcon from '@/components/DarkimIcon';

interface ProductHeroShowcaseProps {
  product: ProductModel;
  heroImgError: boolean;
  onImgError: () => void;
}

/**
 * ProductHeroShowcase
 * Neo-Brutalist sticky showcase card displaying the product hero image,
 * placeholder brand badge, decorative barcode, and verified attribute pill.
 */
export default function ProductHeroShowcase({
  product,
  heroImgError,
  onImgError,
}: ProductHeroShowcaseProps) {
  return (
    <section className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      {/* Main Hero Image Card */}
      <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col">
        <div className="w-full aspect-[4/3] bg-white brutal-border-sm rounded-xl overflow-hidden flex flex-col items-center justify-center text-center relative select-none">
          {product.image && !heroImgError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={onImgError}
              className="w-full h-full object-contain p-4 pb-12"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 pb-14 bg-gradient-to-b from-[#F4F9F6] to-[#E6F1EA]">
              {/* DARKIM "IM" Green Icon Badge with Underline Bar */}
              <DarkimIcon size="lg" className="mb-2.5" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Foto Produk Belum Tersedia
              </span>
            </div>
          )}

          {/* Decorative Barcode */}
          <div className="absolute bottom-3 inset-x-8 bg-white/95 brutal-border-sm rounded px-3 py-1 flex items-center justify-center gap-1 shadow">
            <div className="w-1 h-4 bg-black"></div>
            <div className="w-2 h-4 bg-black"></div>
            <div className="w-0.5 h-4 bg-black"></div>
            <div className="w-1.5 h-4 bg-black"></div>
            <div className="w-3 h-4 bg-black"></div>
            <div className="w-1 h-4 bg-black"></div>
            <div className="w-2 h-4 bg-black"></div>
            <span className="text-[10px] font-mono font-bold text-black ml-2 tracking-widest">
              {product.barcode}
            </span>
          </div>
        </div>

        {/* Product Attributes Pill Bar */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-black/10 text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00D084]"></span>
            Barcode Terverifikasi
          </span>
          <span className="bg-gray-100 brutal-border-sm px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase text-black">
            {product.category}
          </span>
        </div>
      </div>
    </section>
  );
}
