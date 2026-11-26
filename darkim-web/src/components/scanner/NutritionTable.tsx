'use client';

import { NutritionEvaluation } from '@/types';
import { Icons } from '@/components/ui/Icons';

interface NutritionTableProps {
  evaluation: NutritionEvaluation;
  tableMode: 'status' | 'nutrition';
  onToggleTableMode: () => void;
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
}: NutritionTableProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onToggleTableMode}
          className="bg-white hover:bg-gray-50 brutal-border-sm brutal-shadow-sm px-3 py-1.5 rounded-xl text-[11px] font-black uppercase text-black flex items-center gap-1.5 brutal-btn cursor-pointer"
        >
          <Icons.Table className="w-3.5 h-3.5 text-black" />
          <span>Tampilan: {tableMode === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'}</span>
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
