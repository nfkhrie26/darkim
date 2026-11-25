'use client';

interface TicketPhotoEvidenceProps {
  frontPhoto?: string | null;
  nutritionPhoto?: string | null;
  onPreview: (url: string) => void;
}

export default function TicketPhotoEvidence({
  frontPhoto,
  nutritionPhoto,
  onPreview,
}: TicketPhotoEvidenceProps) {
  return (
    <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black">
          Bukti Fisik
        </span>
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Foto Kemasan dari Pengguna
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {frontPhoto ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-700">Kemasan Depan:</span>
            <div
              onClick={() => onPreview(frontPhoto)}
              className="cursor-pointer brutal-border-sm brutal-shadow-sm rounded-xl overflow-hidden aspect-square bg-gray-100 hover:opacity-90 transition-opacity"
            >
              <img src={frontPhoto} alt="Kemasan Depan" className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="brutal-border-sm border-dashed border-gray-400 rounded-xl p-4 text-center text-xs text-gray-500 aspect-square flex items-center justify-center font-bold">
            Tidak ada foto depan
          </div>
        )}

        {nutritionPhoto ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-700">Tabel Gizi:</span>
            <div
              onClick={() => onPreview(nutritionPhoto)}
              className="cursor-pointer brutal-border-sm brutal-shadow-sm rounded-xl overflow-hidden aspect-square bg-gray-100 hover:opacity-90 transition-opacity"
            >
              <img src={nutritionPhoto} alt="Tabel Gizi" className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="brutal-border-sm border-dashed border-gray-400 rounded-xl p-4 text-center text-xs text-gray-500 aspect-square flex items-center justify-center font-bold">
            Tidak ada foto gizi
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-500 italic mt-0.5">Klik foto untuk memperbesar tampilan.</p>
    </div>
  );
}
