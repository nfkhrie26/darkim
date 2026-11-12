'use client';

interface CatalogPaginationProps {
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function CatalogPagination({
  currentPage = 2,
  onPageChange,
}: CatalogPaginationProps) {
  return (
    <nav aria-label="Navigasi Halaman Katalog" className="w-full flex items-center justify-center gap-1.5 sm:gap-2 my-4 select-none">
      {/* PREV Button */}
      <button
        type="button"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        className="bg-white brutal-border-sm brutal-shadow-sm rounded-lg px-3 py-1 text-xs font-black uppercase text-black brutal-btn cursor-pointer"
      >
        PREV
      </button>

      {/* Page 1 */}
      <button
        type="button"
        onClick={() => onPageChange?.(1)}
        className={`brutal-border-sm brutal-shadow-sm rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black text-black brutal-btn cursor-pointer ${
          currentPage === 1 ? 'bg-[#FFD027]' : 'bg-white'
        }`}
      >
        1
      </button>

      {/* Page 2 (Active - Yellow #FFD027 as in mockup) */}
      <button
        type="button"
        onClick={() => onPageChange?.(2)}
        aria-current={currentPage === 2 ? 'page' : undefined}
        className={`brutal-border-sm brutal-shadow-sm rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black text-black brutal-btn cursor-pointer ${
          currentPage === 2 ? 'bg-[#FFD027]' : 'bg-white'
        }`}
      >
        2
      </button>

      {/* Page 3 */}
      <button
        type="button"
        onClick={() => onPageChange?.(3)}
        className={`brutal-border-sm brutal-shadow-sm rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black text-black brutal-btn cursor-pointer ${
          currentPage === 3 ? 'bg-[#FFD027]' : 'bg-white'
        }`}
      >
        3
      </button>

      {/* Ellipsis */}
      <span className="w-6 text-center text-xs font-black text-black">...</span>

      {/* Page 13 */}
      <button
        type="button"
        onClick={() => onPageChange?.(13)}
        className="bg-white brutal-border-sm brutal-shadow-sm rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black text-black brutal-btn cursor-pointer"
      >
        13
      </button>

      {/* NEXT Button (Green #00D084 as in mockup) */}
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage + 1)}
        className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-3 py-1 text-xs font-black uppercase text-black brutal-btn cursor-pointer"
      >
        NEXT
      </button>
    </nav>
  );
}

