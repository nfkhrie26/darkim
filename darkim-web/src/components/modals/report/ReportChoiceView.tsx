import { Icons } from '@/components/ui/Icons';

interface ReportChoiceViewProps {
  productName?: string;
  barcode?: string;
  onSelectNutrition: () => void;
  onSelectNotes: () => void;
  onClose: () => void;
}

/**
 * ReportChoiceView
 * Selection step inside the Report Modal: Choose between Data Gizi (nutrition) or Other issues (notes).
 */
export default function ReportChoiceView({
  productName,
  barcode,
  onSelectNutrition,
  onSelectNotes,
  onClose,
}: ReportChoiceViewProps) {
  return (
    <div>
      <div className="mb-4">
        <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
          Laporan Produk
        </span>
        <h3 className="text-base sm:text-lg font-black text-black mt-1">
          Pilih Alasan Laporan
        </h3>
        <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-relaxed">
          Pilih jenis kendala yang Anda temukan agar laporan dapat ditangani dengan tepat:
        </p>

        {(productName || barcode) && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 mt-2.5">
            {productName && (
              <span className="bg-[#E6F1EA] brutal-border-sm px-2 py-0.5 rounded text-black font-black">
                {productName}
              </span>
            )}
            {barcode && (
              <span className="font-mono text-black bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded">
                {barcode}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {/* Opsi 1: Data Gizi Tidak Lengkap atau Tidak Akurat -> Arahkan ke Pelengkapan Data */}
        <button
          type="button"
          onClick={onSelectNutrition}
          className="w-full text-left bg-white hover:bg-emerald-50/70 brutal-border brutal-shadow-sm rounded-2xl p-4 transition-all duration-150 flex items-start gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-[#00D084] brutal-border-sm flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <Icons.Table className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-emerald-900">
              Data Gizi Tidak Lengkap atau Tidak Akurat
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Koreksi atau lengkapi nilai gizi dengan panduan foto kemasan.
            </p>
          </div>
        </button>

        {/* Opsi 2: Kendala Lainnya -> Arahkan ke Form Catatan */}
        <button
          type="button"
          onClick={onSelectNotes}
          className="w-full text-left bg-white hover:bg-amber-50/70 brutal-border brutal-shadow-sm rounded-2xl p-4 transition-all duration-150 flex items-start gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-[#FFD027] brutal-border-sm flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <Icons.Flag className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-amber-950">
              Kendala Lainnya
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Salah nama produk, barcode tertukar, atau kendala deskripsi lainnya.
            </p>
          </div>
        </button>
      </div>

      <div className="mt-5 pt-3 border-t-2 border-black/10 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
