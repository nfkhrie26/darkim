'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icons';

type DemoStep = 'scan' | 'result';

export default function HeroScannerDemo() {
  const [step, setStep] = useState<DemoStep>('scan');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((prev) => (prev === 'scan' ? 'result' : 'scan'));
    }, step === 'scan' ? 3000 : 4000);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="bg-[#E6F1EA] brutal-border-lg brutal-shadow-md rounded-3xl p-4 sm:p-5 flex flex-col gap-3 relative select-none">
      {/* Top Demo Navigation Tabs (Centered) */}
      <div className="flex items-center justify-center border-b-2.5 border-black pb-2.5">
        <div className="flex items-center gap-1.5 bg-white brutal-border-sm rounded-xl p-1">
          <button
            type="button"
            onClick={() => setStep('scan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              step === 'scan'
                ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <Icons.Barcode className="w-3.5 h-3.5 text-black shrink-0" />
            <span>1. Pindai</span>
          </button>

          <button
            type="button"
            onClick={() => setStep('result')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              step === 'result'
                ? 'bg-[#FFD027] text-black brutal-border-sm brutal-shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <Icons.Check className="w-3.5 h-3.5 text-black shrink-0" />
            <span>2. Analisis</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="relative w-full aspect-square rounded-2xl brutal-border bg-white overflow-hidden flex items-center justify-center">
        {step === 'scan' ? (
          /* State 1: Kemasan Sedang Di-Scan dengan Animasi Laser Scanner */
          <div className="relative w-full h-full flex items-center justify-center p-2 bg-[#E6F1EA] animate-in fade-in duration-200">
            {/* Viewfinder Target Brackets di 4 Sudut */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-3 border-l-3 border-black z-20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-3 border-r-3 border-black z-20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-3 border-l-3 border-black z-20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-3 border-r-3 border-black z-20 pointer-events-none" />

            {/* Single 3D Low-Poly Pixelated Snack Package Asset */}
            <Image
              src="/assets/landing/hero-3d-single-snack.jpg"
              alt="Kemasan snack keripik kentang 3D low-poly pixelated"
              width={600}
              height={600}
              priority
              className="w-full h-full object-contain rounded-xl"
            />

            {/* Animated Laser Scanning Line */}
            <div
              className="absolute left-4 right-4 h-1 bg-[#00D084] shadow-[0_0_14px_#00D084] z-20 pointer-events-none animate-scan-beam"
              style={{
                animation: 'heroScanBeam 2s ease-in-out infinite alternate',
              }}
            />
          </div>
        ) : (
          /* State 2: Tab Hasil Analisa (Placeholder Info & Gizi) */
          <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-[#E6F1EA] animate-in fade-in zoom-in-95 duration-200">
            {/* Top Bar: Barcode Placeholder & Badge */}
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
              <span className="font-mono text-xs font-bold text-gray-700">EAN: 8992753123456</span>
              <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-black">
                Hasil Analisis
              </span>
            </div>

            {/* Product Placeholder */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-black leading-snug">
                [Contoh Nama Produk Kemasan]
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Takaran Saji: 50 g (1 sajian per kemasan)
              </p>
            </div>

            {/* Dua Profil Rekomendasi (Diabetes & Hipertensi) */}
            <div className="flex flex-col gap-2">
              {/* Profil Diabetes */}
              <div className="bg-white brutal-border-sm rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00D084] border border-black shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase text-black truncate">
                      Profil Diabetes Melitus
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      Gula 2g / sajian (Kandungan Rendah)
                    </div>
                  </div>
                </div>
                <span className="bg-[#00D084] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black shrink-0">
                  Aman
                </span>
              </div>

              {/* Profil Hipertensi */}
              <div className="bg-white brutal-border-sm rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFD027] border border-black shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase text-black truncate">
                      Profil Hipertensi
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      Natrium 260mg / sajian (Kandungan Sedang)
                    </div>
                  </div>
                </div>
                <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black shrink-0">
                  Perhatikan
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
              <div className="bg-white brutal-border-sm rounded-lg p-1">
                <div className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Kalori</div>
                <div className="text-xs font-black font-mono text-black">130 kkal</div>
              </div>
              <div className="bg-emerald-50 brutal-border-sm rounded-lg p-1">
                <div className="text-[8px] sm:text-[9px] text-emerald-800 font-bold uppercase">Gula</div>
                <div className="text-xs font-black font-mono text-black">2 g</div>
              </div>
              <div className="bg-amber-50 brutal-border-sm rounded-lg p-1">
                <div className="text-[8px] sm:text-[9px] text-amber-900 font-bold uppercase">Natrium</div>
                <div className="text-xs font-black font-mono text-black">260 mg</div>
              </div>
              <div className="bg-white brutal-border-sm rounded-lg p-1">
                <div className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Lemak</div>
                <div className="text-xs font-black font-mono text-black">1.5 g</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Keyframe for Laser Scan Beam */}
      <style jsx>{`
        @keyframes heroScanBeam {
          0% {
            top: 8%;
            opacity: 0.3;
          }
          50% {
            top: 88%;
            opacity: 1;
          }
          100% {
            top: 8%;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
