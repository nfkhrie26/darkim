'use client';

import { OFF_CATEGORIES } from '@/constants/offCategories';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Restricted OpenFoodFacts category dropdown selector (no custom free-text input allowed).
 */
export default function CategorySelect({
  value,
  onChange,
  required = false,
  disabled = false,
  className,
}: CategorySelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={
          className ||
          'w-full bg-white brutal-border-sm rounded-xl py-2.5 pl-3 pr-8 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer appearance-none'
        }
      >
        <option value="">-- Pilih Kategori Produk --</option>
        {OFF_CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
