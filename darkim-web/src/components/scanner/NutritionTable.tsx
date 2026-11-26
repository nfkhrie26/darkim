'use client';

import { NutritionEvaluation } from '@/types';
import { Icons } from '@/components/ui/Icons';

interface NutritionTableProps {
  evaluation: NutritionEvaluation;
  tableMode: 'status' | 'nutrition';
  onToggleTableMode?: () => void;
  onSelectTableMode?: (mode: 'status' | 'nutrition') => void;
}

/**
 * Dual-mode nutrition table:
 * 1. "status": Disease-specific evaluation table with yellow header (#FFD027).
 * 2. "nutrition": Complete combined nutrition facts table with DARKIM green header (#00D084).
 */
export default function NutritionTable({
  evaluation,
  tableMode,
  onToggleTableMode,
  onSelectTableMode,
}: NutritionTableProps) {
  const handleSelectMode = (mode: 'status' | 'nutrition') => {
    if (mode === tableMode) return;
    if (onSelectTableMode) {
      onSelectTableMode(mode);
    } else if (onToggleTableMode) {
      onToggleTableMode();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Mode Selector Buttons: Two buttons with active color matching the respective table header */}
      <div className="flex items-center justify-end gap-2 flex-wrap" role="tablist" aria-label="Pilihan Tampilan Tabel">
        {/* Tombol 1: Status Zat Gizi (Kuning #FFD027 saat aktif) */}
        <button
          type="button"
          role="tab"
          aria-selected={tableMode === 'status'}
          onClick={() => handleSelectMode('status')}
          className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-colors ${
            tableMode === 'status'
              ? 'bg-[#FFD027] text-black brutal-border-sm brutal-shadow-sm'
              : 'bg-white hover:bg-gray-100 text-black brutal-border-sm'
          }`}
        >
          Status Zat Gizi
        </button>

        {/* Tombol 2: Informasi Nilai Gizi (Hijau #00D084 saat aktif) */}
        <button
          type="button"
          role="tab"
          aria-selected={tableMode === 'nutrition'}
          onClick={() => handleSelectMode('nutrition')}
          className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-colors ${
            tableMode === 'nutrition'
              ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
              : 'bg-white hover:bg-gray-100 text-black brutal-border-sm'
          }`}
        >
          Informasi Nilai Gizi
        </button>
      </div>

      {tableMode === 'status' ? (
        /* View 1: Status Zat Gizi (Sesuai Profil Penyakit, Header Kuning #FFD027) */
        <div className="w-full bg-white brutal-border brutal-shadow rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFD027] border-b-2 border-black text-black font-black text-xs sm:text-sm uppercase tracking-wider">
                <th className="py-2.5 px-3 w-1/3">ZAT GIZI</th>
                <th className="py-2.5 px-3 w-1/3 text-center">STATUS</th>
                <th className="py-2.5 px-3 w-1/3 text-right">
                  JUMLAH
                  {evaluation.nutritionBasis && (
                    <span className="block text-[10px] font-bold normal-case tracking-normal opacity-80">
                      ({evaluation.nutritionBasis})
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {evaluation.statusTable.map((item, idx) => {
                let badgeClass = 'bg-[#00D084] text-black';
                if (item.statusColor === 'red') {
                  badgeClass = 'bg-[#FF4D4D] text-white';
                } else if (item.statusColor === 'yellow') {
                  badgeClass = 'bg-[#FFD027] text-black';
                } else if (item.statusColor === 'white') {
                  badgeClass = 'bg-white text-black';
                }
                return (
                  <tr key={idx} className="border-b-2 border-black last:border-b-0">
                    <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">{item.zat}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm ${badgeClass}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">{item.jumlah}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* View 2: Informasi Nilai Gizi Lengkap (Gabungan Diabetes & Hipertensi, Header Hijau DARKIM #00D084) */
        <div className="w-full bg-white brutal-border brutal-shadow rounded-xl overflow-hidden">
          <div className="bg-[#00D084] border-b-2 border-black py-2 px-3 text-center">
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-black">
              Informasi Nilai Gizi {evaluation.nutritionBasis ? `(${evaluation.nutritionBasis})` : ''}
            </h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E6F1EA] border-b-2 border-black text-black font-black text-xs uppercase tracking-wider">
                <th className="py-2 px-3">ZAT GIZI</th>
                <th className="py-2 px-3 text-right">
                  JUMLAH {evaluation.nutritionBasis ? `(${evaluation.nutritionBasis})` : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {evaluation.nutritionTable.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b-2 border-black last:border-b-0 hover:bg-[#E6F1EA]/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">{item.zat}</td>
                  <td className="py-2.5 px-3 text-right text-xs sm:text-sm font-black text-black">{item.jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
