'use client';

import Link from 'next/link';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';
import FooterThreeSnacks from '@/components/landing/FooterThreeSnacks';

export default function LandingFooter() {
  return (
    <footer className="w-full bg-white brutal-border brutal-shadow rounded-3xl p-6 sm:p-8 mt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2.5 border-black">
        {/* Brand & Description */}
        <div className="flex flex-col items-start gap-3">
          <DarkimLogo />

          <p className="text-xs sm:text-sm font-semibold text-gray-600 max-w-md leading-relaxed">
            Sistem Pendukung Keputusan (SPK) Evaluasi Nilai Gizi Pangan Kemasan untuk Profil Hipertensi dan Diabetes Melitus.
          </p>
        </div>

        {/* Buttons & 3D Three.js Snacks Asset (Side-by-side on mobile & desktop) */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 sm:gap-4">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 md:flex-initial">
            <Link
              href="/pindai"
              className="bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Icons.Barcode className="w-4 h-4 text-black shrink-0" />
              <span>Pindai Barcode</span>
            </Link>

            <Link
              href="/katalog"
              className="bg-white text-black hover:bg-gray-50 brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Icons.Search className="w-4 h-4 text-black shrink-0" />
              <span>Katalog Pangan</span>
            </Link>
          </div>

          {/* Real 3D Interactive Three.js Scene: Low-Poly Ciki Kentang & Minuman Kaleng */}
          <div className="shrink-0 flex items-center justify-center">
            <FooterThreeSnacks />
          </div>
        </div>
      </div>

      {/* Bottom Info & Copyright */}
      <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
        <div>
          Standar: Permenkes RI No. 30/2013 & Open Food Facts Database.
        </div>
        <div>
          &copy; {new Date().getFullYear()} DARKIM. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
