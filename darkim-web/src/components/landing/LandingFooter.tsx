'use client';

import Link from 'next/link';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';

export default function LandingFooter() {
  return (
    <footer className="w-full bg-white brutal-border brutal-shadow rounded-3xl p-6 sm:p-8 mt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2.5 border-black">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <DarkimLogo />
          <p className="text-xs font-semibold text-gray-600 max-w-md mt-1 leading-relaxed">
            Sistem Pendukung Keputusan (SPK) Evaluasi Nilai Gizi Pangan Kemasan untuk Profil Hipertensi dan Diabetes Melitus.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pindai"
            className="bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center gap-1.5"
          >
            <Icons.Barcode className="w-3.5 h-3.5 text-black" />
            <span>Pindai Barcode</span>
          </Link>

          <Link
            href="/katalog"
            className="bg-white text-black hover:bg-gray-50 brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider brutal-btn inline-flex items-center gap-1.5"
          >
            <Icons.Search className="w-3.5 h-3.5 text-black" />
            <span>Katalog Pangan</span>
          </Link>
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
