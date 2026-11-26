'use client';

import Link from 'next/link';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';
import HeroScannerDemo from './HeroScannerDemo';

export default function HeroSection() {
  return (
    <>
      {/* 1. Main Hero Content Card */}
      <section className="w-full bg-white brutal-border brutal-shadow rounded-3xl p-6 sm:p-10 lg:p-12 mb-6 lg:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Logo, Headline, Description & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* DARKIM Logo inside Hero Card */}
            <div className="mb-6">
              <DarkimLogo />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.1] mb-5">
              Pindai Barcode,{' '}
              <span className="text-[#00D084] underline decoration-4 decoration-black">
                Evaluasi Gizi
              </span>{' '}
              dalam Sekejap.
            </h1>

            <p className="text-sm sm:text-base font-semibold text-gray-700 leading-relaxed max-w-2xl mb-8">
              Sistem pendukung keputusan cerdas untuk mengevaluasi batas aman konsumsi gula, natrium, dan lemak jenuh makanan kemasan secara personal bagi profil <b>Diabetes Melitus</b> dan <b>Hipertensi</b>.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-6">
              <Link
                href="/pindai"
                className="bg-[#00D084] brutal-border brutal-shadow rounded-2xl px-6 py-4 font-black text-sm uppercase tracking-wider text-black brutal-btn inline-flex items-center justify-center gap-2.5 cursor-pointer text-center"
              >
                <Icons.Barcode className="w-5 h-5 text-black" />
                <span>Mulai Pindai Produk</span>
              </Link>

              <Link
                href="/katalog"
                className="bg-white brutal-border-sm brutal-shadow-sm rounded-2xl px-6 py-4 font-bold text-sm uppercase tracking-wider text-black brutal-btn hover:bg-gray-50 inline-flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Icons.Search className="w-4 h-4 text-black" />
                <span>Jelajahi Katalog</span>
              </Link>
            </div>
          </div>

          {/* Desktop Only: Right Column Scanner Demo inside Grid */}
          <div className="hidden lg:block lg:col-span-5 w-full">
            <HeroScannerDemo />
          </div>
        </div>
      </section>

      {/* Mobile Only: Standalone Demo Card (Terpisah dari Card Utama) */}
      <div className="lg:hidden w-full mb-8">
        <HeroScannerDemo />
      </div>
    </>
  );
}
