'use client';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];

  if (current > 3) {
    pages.push('ellipsis-left');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  if (current < total - 2) {
    pages.push('ellipsis-right');
  }

  pages.push(total);
  return pages;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
}: CatalogPaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const visiblePages = getVisiblePages(safeCurrent, safeTotal);

  const isPrevDisabled = disabled || safeCurrent <= 1;
  const isNextDisabled = disabled || safeCurrent >= safeTotal;

  return (
    <nav
      aria-label="Navigasi Halaman Katalog"
      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 my-4 select-none flex-wrap"
    >
      {/* PREV Button */}
      <button
        type="button"
        disabled={isPrevDisabled}
        onClick={() => onPageChange(safeCurrent - 1)}
        className={`bg-white brutal-border-sm brutal-shadow-sm rounded-lg px-3 py-1 text-xs font-black uppercase text-black ${
          isPrevDisabled ? 'opacity-45 cursor-not-allowed' : 'brutal-btn cursor-pointer'
        }`}
      >
        PREV
      </button>

      {visiblePages.map((item) => {
        if (item === 'ellipsis-left' || item === 'ellipsis-right') {
          return (
            <span key={item} className="w-6 text-center text-xs font-black text-black">
              ...
            </span>
          );
        }

        const isActive = item === safeCurrent;
        return (
          <button
            key={item}
            type="button"
            disabled={disabled}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={`brutal-border-sm brutal-shadow-sm rounded-lg min-w-8 h-8 px-2 flex items-center justify-center text-xs font-black text-black ${
              isActive ? 'bg-[#FFD027]' : 'bg-white'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'brutal-btn cursor-pointer'}`}
          >
            {item}
          </button>
        );
      })}

      {/* NEXT Button */}
      <button
        type="button"
        disabled={isNextDisabled}
        onClick={() => onPageChange(safeCurrent + 1)}
        className={`bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-3 py-1 text-xs font-black uppercase text-black ${
          isNextDisabled ? 'opacity-45 cursor-not-allowed' : 'brutal-btn cursor-pointer'
        }`}
      >
        NEXT
      </button>
    </nav>
  );
}
