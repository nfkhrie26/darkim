'use client';

import { useState } from 'react';

export default function ServingSizeCalculator() {
  const [showCalc, setShowCalc] = useState(false);
  const [calcServingSize, setCalcServingSize] = useState<string>('200');
  const [calcNutrientVal, setCalcNutrientVal] = useState<string>('');

  const calcResult = (() => {
    const s = parseFloat(calcServingSize);
    const n = parseFloat(calcNutrientVal);
    if (!isNaN(s) && !isNaN(n) && s > 0) {
      return ((n / s) * 100).toFixed(1);
    }
    return null;
  })();

  return (
    <div className="bg-[#FFFBEB] brutal-border brutal-shadow-sm rounded-2xl p-5 flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <span className="text-xl select-none">💡</span>
        <div className="flex-1 text-xs text-amber-950 leading-relaxed">
          <div className="font-black text-sm text-black mb-1">
            Panduan Pengisian Gizi (Basis Standar per 100g / 100ml)
          </div>
          <p>
            Database DARKIM dan Open Food Facts menyimpan angka gizi dalam ukuran <b>per 100g atau per 100ml</b>.
          </p>
          <ul className="list-disc list-inside mt-1.5 space-y-1 font-medium">
            <li>
              <b>Jika takaran saji kemasan adalah 100ml/100g:</b> Angka di kolom &ldquo;Per Sajian&rdquo; kemasan dapat langsung Anda ketik di bawah tanpa perlu dihitung ulang.
            </li>
            <li>
              <b>Jika takaran saji kemasan bukan 100ml/100g:</b> (misal 200ml atau 250ml per sajian), konversikan dulu ke per 100ml dengan rumus: <code className="bg-amber-100 brutal-border-sm px-1.5 py-0.5 rounded font-mono font-bold">(Nilai / Takaran Saji) &times; 100</code>.
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Calculator Toggle */}
      <div className="border-t-2 border-black/10 pt-3">
        <button
          type="button"
          onClick={() => setShowCalc(!showCalc)}
          className="text-xs font-black text-black hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showCalc ? '▲ Tutup Kalkulator Cepat' : '▼ Butuh Kalkulator Cepat Konversi per 100ml? Klik di sini'}</span>
        </button>

        {showCalc && (
          <div className="mt-3 bg-white brutal-border-sm brutal-shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in">
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Takaran Saji Kemasan (ml/g)</label>
                <input
                  type="number"
                  step="any"
                  value={calcServingSize}
                  onChange={(e) => setCalcServingSize(e.target.value)}
                  placeholder="200"
                  className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Nilai Gizi di Label (kkal/g/mg)</label>
                <input
                  type="number"
                  step="any"
                  value={calcNutrientVal}
                  onChange={(e) => setCalcNutrientVal(e.target.value)}
                  placeholder="Contoh: 80"
                  className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="bg-[#FFD027] brutal-border-sm brutal-shadow-sm px-5 py-3 rounded-xl text-center shrink-0 w-full sm:w-auto">
              <div className="text-[10px] font-black uppercase tracking-wider text-black">Hasil per 100ml / 100g</div>
              <div className="text-xl font-black text-black font-mono mt-0.5">
                {calcResult !== null ? calcResult : '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
